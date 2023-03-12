import { Topic } from "@prisma/client";
import clsx from "clsx";
import { Modal } from "components/common/Modal";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { styles } from "styles";
import { trpc } from "utils/trpc";

type FormData = {
  title: string;
  content: string;
  topicId: string;
  due: Date;
};

type NewHometaskProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const NewHometask = ({ isOpen, setIsOpen }: NewHometaskProps) => {
  const [topicId, setTopicId] = useState("");
  const { register, handleSubmit } = useForm<FormData>();
  const { data: session } = useSession();
  const { data: topics } = trpc.topic.all.useQuery();
  const utils = trpc.useContext();
  const addHometask = trpc.hometask.add.useMutation({
    async onSuccess() {
      setIsOpen(false);
      await utils.hometask.infinite.invalidate();
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await addHometask.mutateAsync({
        ...data,
        userId: session?.user?.id || "",
        topicId,
        due: new Date(data.due),
      });
    } catch {}
  });

  return (
    <Modal title="Create Hometask" isOpen={isOpen} setIsOpen={setIsOpen}>
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-3 items-center mb-3"></div>
        {/* Title */}
        <div className="my-2">
          <label className="text-lg" htmlFor="title">
            Title:
          </label>
          <input
            id="title"
            {...register("title")}
            type="text"
            className={styles.input}
            disabled={addHometask.isLoading}
          />
        </div>
        {/* Content */}
        <div className="my-2">
          <label className="text-lg" htmlFor="content">
            Content:
          </label>
          <textarea
            id="content"
            {...register("content")}
            className={styles.input}
            disabled={addHometask.isLoading}
          />
        </div>
        {/* Topic */}
        <div className="my-2">
          <label className="text-lg" htmlFor="topic">
            Topic:
          </label>
          <select
            {...register("topicId")}
            id="topic"
            className={styles.select}
            onChange={(e) => setTopicId(e.currentTarget.value)}
          >
            <option selected>Click to choose</option>
            {topics &&
              topics.map((t: Topic) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
          </select>
        </div>
        {/* Due Date */}
        <div className="my-2">
          <label className="text-xl block" htmlFor="topic">
            Due Date:
          </label>
          <input
            {...register("due")}
            id="dueDate"
            type="date"
            className={styles.input}
          />
        </div>
        {/* Submit Form */}
        <button
          className={clsx(styles.actionButton, "my-4")}
          type="submit"
          disabled={addHometask.isLoading}
        >
          Add
        </button>
        {/* Validation Error */}
        {addHometask.error && (
          <p className="text-red-500">{addHometask.error.message}</p>
        )}
      </form>
    </Modal>
  );
};
