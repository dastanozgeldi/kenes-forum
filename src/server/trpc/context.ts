import { type inferAsyncReturnType } from "@trpc/server";
import { type Session } from "next-auth";
import * as trpcNext from "@trpc/server/adapters/next";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { IncomingMessage } from "http";
import ws from "ws";

import { prisma } from "../db/client";
import { getSession } from "next-auth/react";

type CreateContextOptions = {
  session: Session | null;
};

/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://beta.create.t3.gg/en/usage/trpc#-servertrpccontextts
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts:
    | trpcNext.CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getSession(opts);

  console.log("createContext for", session?.user?.name ?? "unknown user");

  return await createContextInner({
    session,
  });
};

export type Context = inferAsyncReturnType<typeof createContext>;
