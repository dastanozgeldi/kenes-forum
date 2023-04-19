import type { Session } from "next-auth";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { styles } from "styles";
import { trpc } from "utils/trpc";
import { Avatar } from "components/common/Avatar";

type MessagesProps = {
  roomId: string;
  session: Session | null;
};

export const Messages = ({ roomId, session }: MessagesProps) => {
  const utils = trpc.useContext();
  const messagesQuery = trpc.message.infinite.useInfiniteQuery(
    { roomId: roomId || "" },
    {
      getPreviousPageParam: (d) => d.prevCursor,
    }
  );
  const { hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage } =
    messagesQuery;

  const [messages, setMessages] = useState(() => {
    const msgs = messagesQuery.data?.pages.map((page) => page.items).flat();
    return msgs;
  });
  type Message = NonNullable<typeof messages>[number];
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  // fn to add and dedupe new messages onto state
  const addMessages = useCallback((incoming?: Message[]) => {
    setMessages((current) => {
      const map: Record<Message["id"], Message> = {};
      for (const msg of current ?? []) {
        map[msg.id] = msg;
      }
      for (const msg of incoming ?? []) {
        map[msg.id] = msg;
      }
      return Object.values(map).sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );
    });
  }, []);

  // when new data from `useInfiniteQuery`, merge with current state
  useEffect(() => {
    const msgs = messagesQuery.data?.pages.map((page) => page.items).flat();
    addMessages(msgs);
  }, [messagesQuery.data?.pages, addMessages]);

  const scrollToBottomOfList = useCallback(() => {
    if (scrollTargetRef.current == null) return;

    scrollTargetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [scrollTargetRef]);

  useEffect(() => {
    scrollToBottomOfList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // subscribe to new messages and add
  trpc.message.onAdd.useSubscription(undefined, {
    onData(message) {
      addMessages([message]);
    },
    onError(err) {
      console.error("Subscription error:", err);
      // we might have missed a message - invalidate cache
      utils.message.infinite.invalidate();
    },
  });

  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  trpc.message.whoIsTyping.useSubscription(undefined, {
    onData(data) {
      setCurrentlyTyping(data);
    },
  });

  return (
    <div className={styles.card}>
      <section className="h-full flex flex-col justify-end space-y-4">
        <div className="overflow-y-auto space-y-4">
          <button
            data-testid="loadMore"
            onClick={() => fetchPreviousPage()}
            disabled={!hasPreviousPage || isFetchingPreviousPage}
            className={styles.actionButton}
          >
            {isFetchingPreviousPage
              ? "Loading more..."
              : hasPreviousPage
              ? "Load More"
              : "Nothing more to load"}
          </button>
          <div className="space-y-4">
            {messages?.map((item) => (
              <article
                key={item.id}
                className="text-gray-800 dark:text-gray-100"
              >
                <header className="flex items-center space-x-2 text-sm">
                  <Link
                    className="flex items-center gap-1"
                    href={`/users/${item.authorId || "ghost"}`}
                  >
                    <Avatar size={28} src={item.authorImage} />
                    <h3 className="text-md">{item.authorName}</h3>
                  </Link>
                  <span className="text-gray-500">
                    {new Intl.DateTimeFormat("en-GB", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(item.createdAt)}
                  </span>
                </header>
                <p className="text-xl leading-tight whitespace-pre-line">
                  {item.content}
                </p>
              </article>
            ))}
            <div ref={scrollTargetRef}></div>
          </div>
        </div>
        <div className="w-full">
          <AddMessageForm
            roomId={roomId}
            session={session}
            onMessagePost={() => scrollToBottomOfList()}
          />
          <p className="h-2 italic text-gray-400">
            {currentlyTyping.length
              ? `${currentlyTyping.join(", ")} typing...`
              : ""}
          </p>
        </div>
      </section>
    </div>
  );
};

export const AddMessageForm = ({
  roomId,
  session,
  onMessagePost,
}: {
  roomId: string;
  session: Session | null;
  onMessagePost: () => void;
}) => {
  const { data: hasUserJoined } = trpc.participant.hasJoined.useQuery({
    roomId,
    userId: session?.user?.id || "",
  });
  const addMessage = trpc.message.add.useMutation();
  const isTyping = trpc.message.isTyping.useMutation();
  const [message, setMessage] = useState("");
  const [enterToPostMessage, setEnterToPostMessage] = useState(true);

  const postMessage = async () => {
    const input = { content: message, roomId };
    try {
      await addMessage.mutateAsync(input);
      setMessage("");
      onMessagePost();
    } catch {}
  };

  if (!session?.user?.name) {
    return (
      <div className="flex items-center rounded bg-gray-200 dark:bg-gray-800 px-3 py-2 text-lg text-gray-700 dark:text-gray-200 w-full justify-between">
        <p className="font-bold">
          You have to{" "}
          <button
            className="inline font-bold underline"
            onClick={() => signIn()}
          >
            sign in
          </button>{" "}
          to write.
        </p>
        <button className={styles.actionButton} onClick={() => signIn()}>
          Sign In
        </button>
      </div>
    );
  }
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          /**
           * In a real app you probably don't want to use this manually
           * Checkout React Hook Form - it works great with tRPC
           * @link https://react-hook-form.com/
           */
          await postMessage();
        }}
      >
        <fieldset disabled={addMessage.isLoading} className="min-w-0">
          <div className="flex rounded bg-gray-200 dark:bg-[#202020] px-3 py-2 text-lg text-gray-200 w-full">
            <textarea
              value={message}
              disabled={!hasUserJoined}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-transparent text-gray-800 dark:text-gray-100 outline-none flex-1 outline-0 resize-none max-h-max overflow-y-visible"
              rows={message.split(/\r|\n/).length}
              id="content"
              name="content"
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Shift") {
                  setEnterToPostMessage(false);
                }
                if (e.key === "Enter" && enterToPostMessage) {
                  postMessage();
                }
                isTyping.mutate({ typing: true });
              }}
              onKeyUp={(e) => {
                if (e.key === "Shift") setEnterToPostMessage(true);
              }}
              onBlur={() => {
                setEnterToPostMessage(true);
                isTyping.mutate({ typing: false });
              }}
            />
            <button disabled={!hasUserJoined} className={styles.actionButton}>
              Submit
            </button>
          </div>
        </fieldset>
        {addMessage.error && (
          <p className="text-red-500">{addMessage.error.message}</p>
        )}
      </form>
    </>
  );
};
