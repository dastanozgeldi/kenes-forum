import useState from "react-usestateref";
import { IoSend } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { Avatar } from "components/common/Avatar";
import { FaRobot } from "react-icons/fa";
import user from "assets/user.png"

enum Creator {
  Me = 0,
  Bot = 1,
}

interface MessageProps {
  text: string;
  from: Creator;
  key: number;
  author?: any;
}

interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
}

const ChatMessage = ({ text, from }: MessageProps) => {
  return (
    <>
      {from == Creator.Me && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <Avatar size={40} src={user} />
          <p className="text-gray-700 dark:text-gray-200">{text}</p>
        </div>
      )}
      {from == Creator.Bot && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap">
          <FaRobot size={40} className="text-primary" />
          <p className="text-gray-700 dark:text-gray-200">{text}</p>
        </div>
      )}
    </>
  );
};

const ChatInput = ({ onSend, disabled }: InputProps) => {
  const [input, setInput] = useState("");

  const sendInput = () => {
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (event: any) => {
    // Enter key pressed
    if (event.keyCode === 13) {
      sendInput();
    }
  };

  return (
    <div className="bg-white dark:bg-[#111] border-2 dark:border-gray-700 p-2 rounded-lg flex justify-center">
      <input
        type="text"
        value={input}
        onChange={(ev: any) => setInput(ev.target.value)}
        className="w-full py-2 px-3 text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none bg-transparent"
        placeholder="Ask me anything"
        disabled={disabled}
        onKeyDown={(ev) => handleKeyDown(ev)}
      />
      {disabled ? (
        <img src="loading.gif" alt="Loading" width={40} height={40} />
      ) : (
        <button onClick={() => sendInput()} className="px-2">
          <IoSend className="w-8 h-8 text-primary" />
        </button>
      )}
    </div>
  );
};

export default function Home() {
  const { data: session } = useSession();
  const [messages, setMessages, messagesRef] = useState<MessageProps[]>([]);
  const [loading, setLoading] = useState(false);

  const callApi = async (input: string) => {
    setLoading(true);

    const myMessage: MessageProps = {
      text: input,
      from: Creator.Me,
      key: new Date().getTime(),
    };

    setMessages([...messagesRef.current, myMessage]);
    const response = await fetch("/api/generate-answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
      }),
    }).then((response) => response.json());
    setLoading(false);

    console.log(response.text);

    if (response.text) {
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.Bot,
        key: new Date().getTime(),
      };
      setMessages([...messagesRef.current, botMessage]);
    } else {
      // Show error
    }

    console.log(messages);
  };

  return (
    <main className="relative max-w-2xl mx-auto">
      <div className="sticky top-0 w-full pt-10 px-4">
        <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
      </div>

      <div className="mt-10 px-4 space-y-3">
        {messages.map(({ key, text, from }: MessageProps) => (
          <ChatMessage
            key={key}
            text={text}
            from={from}
            author={session?.user}
          />
        ))}
        {messages.length == 0 && (
          <p className="text-center text-gray-400">
            How can I assist you today?
          </p>
        )}
      </div>
    </main>
  );
}
