import { useSession } from "next-auth/react";
import NextError from "next/error";
import { useRouter } from "next/router";
import Link from "next/link";
import { styles } from "styles";
import { Page } from "layouts/Page";
import { EditRoom } from "components/rooms/EditRoom";
import { Avatar } from "components/common/Avatar";
import { trpc } from "utils/trpc";
import { env } from "env/client.mjs";
import { Messages } from "components/rooms/Messages";
import clsx from "clsx";

const Participants = ({ roomId }: { roomId: string }) => {
  const { data: participants } = trpc.participant.all.useQuery({ roomId });

  return (
    <div className={clsx(styles.card, "my-2")}>
      <h1 className="my-2 text-2xl font-semibold text-center">
        Participants - {participants?.length}
      </h1>
      <div className="w-full flex flex-nowrap gap-1 overflow-x-scroll">
        {participants &&
          participants.map((item) => (
            <Link href={`/users/${item.userId}`}>
              <Avatar src={item.user.image} size={32} />
            </Link>
          ))}
      </div>
    </div>
  );
};

const ViewRoom = () => {
  const { data: session } = useSession();
  // Router
  const router = useRouter();
  const id = router.query.id as string;
  // tRPC
  const roomQuery = trpc.room.byId.useQuery({ id });
  const { data: room } = roomQuery;
  const { data: topics } = trpc.topic.all.useQuery();

  // room fetch fail
  if (roomQuery.error) {
    return (
      <NextError
        title={roomQuery.error.message}
        statusCode={roomQuery.error.data?.httpStatus ?? 500}
      />
    );
  }

  if (!room || roomQuery.status !== "success") return "Loading...";
  return (
    <Page title={room.title}>
      <div className="my-4 lg:my-0 max-w-[60ch] mx-auto">
        <Participants roomId={room.id} />
        <h1 className="text-4xl font-extrabold">{room.title}</h1>
        <p className="my-2">{room.description}</p>
        <div className="flex items-center justify-between my-2">
          <p className="text-gray-400">
            Created {room.createdAt.toLocaleDateString("en-us")}
          </p>
        </div>
        <EditRoom
          data={room}
          topics={topics}
          session={session}
          router={router}
        />
        <Messages roomId={room.id} session={session} />
      </div>
    </Page>
  );
};

export default ViewRoom;
