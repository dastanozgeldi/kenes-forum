import { Modal } from "components/common/Modal";
import { useSession } from "next-auth/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { styles } from "styles";
import { trpc } from "utils/trpc";

type FormData = {
  username: string;
  bio: string;
  grade: string;
};

type EditProfileProps = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const EditProfile = ({ isOpen, setIsOpen }: EditProfileProps) => {
  // States
  const [username, setUsername] = useState<string | null | undefined>(null);
  const [bio, setBio] = useState<string | null | undefined>(null);
  const [grade, setGrade] = useState<string | null | undefined>(null);
  // Form
  const { register, handleSubmit } = useForm<FormData>();
  // tRPC
  const { data: session } = useSession();
  const id = session?.user?.id as string;
  const { data: user } = trpc.user.info.useQuery({ id });

  const utils = trpc.useContext();
  const editProfile = trpc.user.edit.useMutation({
    async onSuccess() {
      await utils.user.info.invalidate({ id });
      setIsOpen(false);
    },
  });

  const onSubmit = handleSubmit(async () => {
    try {
      await editProfile.mutateAsync({
        id,
        data: { username, bio, grade },
      });
    } catch {}
  });

  useEffect(() => {
    setUsername(user?.username);
    setBio(user?.bio);
    setGrade(user?.grade);
  }, []);

  if (!session) return <>Yo u gotta sign in</>;
  return (
    <Modal title="Profile Settings" isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="space-y-4 py-4" onSubmit={onSubmit}>
        {/* Username */}
        <div>
          <label className="text-lg" htmlFor="username">
            Username:
          </label>
          <input
            {...register("username")}
            id="username"
            type="text"
            className={styles.input}
            value={username || ""}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-lg" htmlFor="bio">
            Bio:
          </label>
          <textarea
            id="bio"
            {...register("bio")}
            className={styles.textarea}
            value={bio || ""}
            onChange={(e) => setBio(e.currentTarget.value)}
            disabled={editProfile.isLoading}
          />
        </div>

        <button
          className="py-2 px-4 rounded-md text-white bg-primary hover:bg-blue-600 hover:duration-500"
          type="submit"
          disabled={editProfile.isLoading}
        >
          Save
        </button>

        {editProfile.error && (
          <p className="text-red-500">{editProfile.error.message}</p>
        )}
      </form>
    </Modal>
  );
};
