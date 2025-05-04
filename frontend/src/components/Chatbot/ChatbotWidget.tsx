import { useState, useRef, useEffect } from "react";
import { Button, Input, ConfigProvider } from "antd";
import { MessageOutlined, CloseOutlined, ReloadOutlined, DownOutlined } from "@ant-design/icons";
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
  <div style={{ 
    ...styles.message(isUser), 
    wordWrap: 'break-word', 
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  }}>
    <ReactMarkdown
        components={{
          p: ({ children }) => <div style={{ margin: 0, padding: 0 }}>{children}</div>,
        }}
      >
        {content.trim()}
    </ReactMarkdown>
  </div>
);

const ChatHeader = ({ onReset }: { onReset: () => void }) => (
  <div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span>Unibot</span>
    <Button
      type="text"
      shape="circle"
      icon={<ReloadOutlined />}
      onClick={onReset}
      title="Tạo đoạn chat mới"
      style={{
        color: 'white',
        backgroundColor: '#1E894E',
        transition: 'all 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#15723F';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1E894E';
      }}
    />
  </div>
);


const ChatContainer = ({
  messages,
  liveMessage,
  bottomRef,
  setIsScrolledUp,
}: {
  messages: Message[];
  liveMessage: Message | null;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  setIsScrolledUp: (value: boolean) => void;
}) => {
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveMessage]);

  return (
    <div style={styles.chatContainer}
    onScroll={(e) => {
      const el = e.currentTarget;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
      setIsScrolledUp(!isAtBottom);
    }}>
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} {...msg} />
      ))}
      {liveMessage?.content && <MessageBubble {...liveMessage} 
      />}
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
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [isComposing, setIsComposing] = useState(false);


  const streamChat = useChatbot(
    (text: string) => {
      setLiveMessage((prev) => ({
        content: (prev?.content || "") + text,
        isUser: false,
      }));
    },
    () => {
      setLiveMessage((msg) => {
        if (msg && !hasAppended.current) {
          setMessages((prev) => [...prev, msg]);
          hasAppended.current = true;
        }
        setIsComposing(false);
        return null;
      });
    },
    () => {
      setMessages((prev) => [
        ...prev,
        { content: "Server lỗi", isUser: false },
      ]);
      setLiveMessage(null);
    }
  );

  const handleSend = () => {
    setIsComposing(true);
    if (!message.trim()) return;
    const userMsg = { content: message, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    hasAppended.current = false;
    streamChat([...messages, userMsg]);
    setMessage("");
    setLiveMessage(null);
  };

  const handleReset = () => {
    setMessages([]);
    setLiveMessage(null);
    setMessage("");
    hasAppended.current = false;
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
          <ChatHeader onReset={handleReset} />
          <ChatContainer
            messages={messages}
            liveMessage={liveMessage}
            bottomRef={bottomRef}
            setIsScrolledUp={setIsScrolledUp}
          />
          {isScrolledUp && !isComposing && !liveMessage && (
              <Button
                shape="circle"
                icon={<DownOutlined />}
                onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                style={{
                  position: "absolute",
                  right: 30,
                  bottom: 150,
                  width: 32,
                  height: 32,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  backgroundColor: "#FFFFFF", // màu xám
                  color: "#1E894E",
                  zIndex: 20,
                }}                
              />
          )}
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