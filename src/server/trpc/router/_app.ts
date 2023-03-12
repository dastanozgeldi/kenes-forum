import { router } from "../trpc";
import { hometaskRouter } from "./hometask";
import { messageRouter } from "./message";
import { noteRouter } from "./note";
import { participantRouter } from "./participant";
import { roomRouter } from "./room";
import { schoolRouter } from "./school";
import { topicRouter } from "./topic";
import { userRouter } from "./user";

export const appRouter = router({
  hometask: hometaskRouter,
  note: noteRouter,
  participant: participantRouter,
  room: roomRouter,
  school: schoolRouter,
  topic: topicRouter,
  user: userRouter,
  message: messageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
