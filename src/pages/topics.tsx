import Link from "next/link";
import { styles } from "styles";
import { trpc } from "utils/trpc";

const Topics = () => {
  const { data } = trpc.topic.all.useQuery();

  return (
    <div className="max-w-[60ch] mx-auto">
      <h1 className={styles.notification}>
        Here is the list of all topics Kenes currently has. They categorize the
        subject of a room, making it easy for you to find what you need!
      </h1>
      <div className={styles.card}>
        {data?.map((t: any) => (
          <Link
            href={`/?topicId=${t.id}`}
            className="flex items-center justify-between px-2 w-full rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:duration-300"
          >
            <div className="flex items-center gap-2 p-2 m-2">{t.name}</div>
            <span className="text-xl px-2 rounded bg-gray-100 dark:bg-gray-800">
              {t.rooms.length}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Topics;
