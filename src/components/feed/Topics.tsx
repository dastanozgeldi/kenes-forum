import Link from "next/link";
import { AiOutlineDown } from "react-icons/ai";
import { trpc } from "utils/trpc";

export const Topics = () => {
  const { data } = trpc.topic.getSome.useQuery({ limit: 5 });

  return (
    <div className="hidden md:block space-y-3">
      <h1 className="text-xl font-semibold px-4">Browse Topics</h1>
      <ul className="overflow-y-auto h-[300px]">
        <Link
          href="/"
          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:duration-300"
        >
          <span className="p-2">All</span>
        </Link>
        {data?.map((t) => (
          <li
            key={t.id}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 hover:duration-300"
          >
            <Link
              href={`/?topicId=${t.id}`}
              className="flex items-center justify-between"
            >
              <span className="p-2">{t.name}</span>
              <span className="px-2 rounded bg-gray-100 dark:bg-gray-800">
                {t.rooms.length}
              </span>
            </Link>
          </li>
        ))}
        <Link
          href="/topics"
          className="w-max flex items-center gap-2 text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:duration-500 px-4 py-2 rounded-lg"
        >
          More <AiOutlineDown size={16} />
        </Link>
      </ul>
    </div>
  );
};
