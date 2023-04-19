import { router } from "../trpc";
import { messageRouter } from "./message";
import { participantRouter } from "./participant";
import { roomRouter } from "./room";
import { topicRouter } from "./topic";
import { userRouter } from "./user";

export const appRouter = router({
  participant: participantRouter,
  room: roomRouter,
  topic: topicRouter,
  user: userRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
