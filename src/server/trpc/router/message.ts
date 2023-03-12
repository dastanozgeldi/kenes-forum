/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Message } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";
import { type Context } from "../context";
import { protectedProcedure, publicProcedure, router } from "../trpc";

interface MyEvents {
  add: (data: Message) => void;
  isTypingUpdate: () => void;
}
declare interface MyEventEmitter {
  on<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  off<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  once<TEv extends keyof MyEvents>(event: TEv, listener: MyEvents[TEv]): this;
  emit<TEv extends keyof MyEvents>(
    event: TEv,
    ...args: Parameters<MyEvents[TEv]>
  ): boolean;
}

class MyEventEmitter extends EventEmitter {}

// In a real app, you'd probably use Redis or something
const ee = new MyEventEmitter();

// who is currently typing, key is `name`
const currentlyTyping: Record<string, { lastTyped: Date }> =
  Object.create(null);

// every 1s, clear old "isTyping"
const interval = setInterval(() => {
  let updated = false;
  const now = Date.now();
  for (const [key, value] of Object.entries(currentlyTyping)) {
    if (now - value.lastTyped.getTime() > 3e3) {
      delete currentlyTyping[key];
      updated = true;
    }
  }
  if (updated) {
    ee.emit("isTypingUpdate");
  }
}, 3e3);
process.on("SIGTERM", () => clearInterval(interval));

const getAuthorOrThrow = (ctx: Context) => {
  const id = ctx.session?.user?.id;
  const name = ctx.session?.user?.name;
  const image = ctx.session?.user?.image;
  if (!name) throw new TRPCError({ code: "FORBIDDEN" });
  return { id, name, image };
};

export const messageRouter = router({
  add: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        roomId: z.string().uuid(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const author = getAuthorOrThrow(ctx);
      const message = await ctx.prisma.message.create({
        data: {
          ...input,
          authorId: author.id,
          authorImage: author.image,
          authorName: author.name,
        },
      });
      ee.emit("add", message);
      delete currentlyTyping[author.name];
      ee.emit("isTypingUpdate");
      return message;
    }),

  isTyping: protectedProcedure
    .input(z.object({ typing: z.boolean() }))
    .mutation(({ input, ctx }) => {
      const author = getAuthorOrThrow(ctx);
      if (!input.typing) {
        delete currentlyTyping[author.name];
      } else {
        currentlyTyping[author.name] = {
          lastTyped: new Date(),
        };
      }
      ee.emit("isTypingUpdate");
    }),

  infinite: publicProcedure
    .input(
      z.object({
        roomId: z.string().uuid(),
        cursor: z.date().nullish(),
        take: z.number().min(1).max(50).nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const take = input.take ?? 10;
      const cursor = input.cursor;

      const page = await ctx.prisma.message.findMany({
        where: { roomId: input.roomId },
        orderBy: { createdAt: "desc" },
        cursor: cursor
          ? {
              createdAt: cursor,
            }
          : undefined,
        take: take + 1,
        skip: 0,
      });
      const items = page.reverse();
      let prevCursor: null | typeof cursor = null;
      if (items.length > take) {
        const prev = items.shift();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prevCursor = prev!.createdAt;
      }
      return {
        items,
        prevCursor,
      };
    }),

  onAdd: publicProcedure.subscription(() => {
    return observable<Message>((emit) => {
      const onAdd = (data: Message) => emit.next(data);
      ee.on("add", onAdd);
      return () => {
        ee.off("add", onAdd);
      };
    });
  }),

  whoIsTyping: publicProcedure.subscription(() => {
    let prev: string[] | null = null;
    return observable<string[]>((emit) => {
      const onIsTypingUpdate = () => {
        const newData = Object.keys(currentlyTyping);

        if (!prev || prev.toString() !== newData.toString()) {
          emit.next(newData);
        }
        prev = newData;
      };
      ee.on("isTypingUpdate", onIsTypingUpdate);
      return () => {
        ee.off("isTypingUpdate", onIsTypingUpdate);
      };
    });
  }),
});
