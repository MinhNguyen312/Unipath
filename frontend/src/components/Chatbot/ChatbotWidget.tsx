import { useState, useRef, useEffect } from "react";
import { Button, Input, ConfigProvider } from "antd";
import { MessageOutlined, CloseOutlined } from "@ant-design/icons";
import { useChatbot } from "../../hooks/useChatbot";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;

interface Message {
  content: string;
  isUser: boolean;
}

const styles = {
  button: {
    position: "fixed" as const,
    bottom: 24,
    right: 24,
    zIndex: 1001,
    width: 56,
    height: 56,
    backgroundColor: "#1E894E",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  popup: {
    position: "fixed" as const,
    bottom: 90,
    right: 24,
    width: 400,
    height: 500,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden" as const,
  },
  header: {
    background: "#1E894E",
    padding: "10px 16px",
    color: "white",
    fontWeight: "bold" as const,
  },
  chatContainer: {
    flex: 1,
    padding: "10px 12px",
    overflowY: "auto" as const,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  message: (isUser: boolean) => ({
    alignSelf: isUser ? "flex-end" as const : "flex-start" as const,
    background: isUser ? "#1E894E" : "#e0e0e0",
    color: isUser ? "white" : "black",
    padding: "8px 12px",
    borderRadius: 16,
    maxWidth: "80%",
    whiteSpace: "pre-wrap" as const,
  }),
};

const MessageBubble = ({ content, isUser }: Message) => (
  <div style={styles.message(isUser)}>
    <ReactMarkdown>{content}</ReactMarkdown>
  </div>
);

const ChatHeader = () => <div style={styles.header}>Unibot</div>;


const ChatContainer = ({
  messages,
  liveMessage,
  bottomRef,
}: {
  messages: Message[];
  liveMessage: Message | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) => {
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveMessage]);

  return (
    <div style={styles.chatContainer}>
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} {...msg} />
      ))}
      {liveMessage && <MessageBubble {...liveMessage} />}
      <div ref={bottomRef} />
    </div>
  );
};

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [liveMessage, setLiveMessage] = useState<Message | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const hasAppended = useRef(false);

  const streamChat = useChatbot(
    (chunk: string) => {
      setLiveMessage((prev) => ({
        content: (prev?.content || "") + chunk,
        isUser: false,
      }));
    },
    () => {
      setLiveMessage((msg) => {
        if (msg && !hasAppended.current) {
          setMessages((prev) => [...prev, msg]);
          hasAppended.current = true;
        }
        return null;
      });
    },
    () => {
      setMessages((prev) => [
        ...prev,
        { content: "Server...", isUser: false },
      ]);
      setLiveMessage(null);
    }
  );

  const handleSend = () => {
    if (!message.trim()) return;
    const userMsg = { content: message, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    hasAppended.current = false;
    streamChat(message);
    setMessage("");
  };

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: "#1E894E" },
        components: {
          Button: {
            colorPrimary: "#1E894E",
            colorPrimaryHover: "#1b5e20",
            colorPrimaryActive: "#388e3c",
          },
        },
      }}
    >
      <Button
        shape="circle"
        type="primary"
        icon={open ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setOpen((prev) => !prev)}
        style={styles.button}
      />

      {open && (
        <div style={styles.popup}>
          <ChatHeader />
          <ChatContainer
            messages={messages}
            liveMessage={liveMessage}
            bottomRef={bottomRef}
          />
          <div style={{ padding: "8px 12px", borderTop: "1px solid #eee" }}>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={4}
              placeholder="Nhập tin nhắn..."
              style={{ 
                resize: "none",
                height: "80px",
                minHeight: "60px"
              }}
            />
            <Button type="primary" block style={{ marginTop: 8 }} onClick={handleSend}>
              Gửi
            </Button>
          </div>
        </div>
      )}
    </ConfigProvider>
  );
}