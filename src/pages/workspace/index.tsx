import { type User } from "@prisma/client";
import { Avatar } from "components/common/Avatar";
import { Workspace } from "layouts/Workspace";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { styles } from "styles";
import { trpc } from "utils/trpc";

type ConnectionItemProps = {
  connection: User;
};

const ConnectionItem = ({ connection }: ConnectionItemProps) => (
  <Link
    href={`/users/${connection.id}`}
    className="flex items-center gap-4 p-4 my-4 rounded-xl border-[1px] border-gray-700 hover:border-gray-500 duration-300"
  >
    <Avatar src={connection.image} size={50} />
    <a>{connection.name}</a>
  </Link>
);

const Connections = () => {
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/api/auth/signin");
    },
  });

  const id = session?.user?.id as string;
  const { data: user } = trpc.user.info.useQuery({ id });
  const { data: connections } = trpc.user.connections.useQuery({ id });

  if (status === "loading") {
    return "Loading or not authenticated...";
  }
  return (
    <Workspace>
      <div className="w-full">
        <h1 className={styles.notification}>
          Here are people from your location.
        </h1>
        <div className="w-full">
          {connections?.map((connection) => (
            <ConnectionItem connection={connection} />
          ))}
        </div>
      </div>
    </Workspace>
  );
};

export default Connections;
