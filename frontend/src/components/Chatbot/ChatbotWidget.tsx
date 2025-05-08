import { useState, useRef, useEffect } from "react";
import { Button, Input, ConfigProvider } from "antd";
import { MessageOutlined, CloseOutlined, ReloadOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useChatbot } from "../../hooks/useChatbot";
import ReactMarkdown from "react-markdown";
import { SendOutlined } from "@ant-design/icons";
import { majorCompareCache } from "../../hooks/useCompareStore";
import remarkGfm from 'remark-gfm';
const { TextArea } = Input;
import { Switch } from 'antd'


interface Message {
  content: string;
  isUser: boolean;
  isSearching?: boolean;
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
    borderRadius: "50%",
  },
  popup: {
    position: "fixed" as const,
    bottom: 90,
    right: 24,
    width: "90vw",
    maxWidth: 400,
    height: "80vh",
    maxHeight: 600,
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
  searchingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    background: "#e0e0e0",
    borderRadius: 16,
    alignSelf: "flex-start" as const,
    color: "#333",
    fontSize: 14,
  }
};

const formatMajorCompareCache = (): string => {
  if (Object.keys(majorCompareCache).length === 0) {
    return "Không có thông tin về các ngành đang so sánh.";
  }

  let result = "Thông tin về các ngành đang so sánh:\n";
  for (const key in majorCompareCache) {
    const info = majorCompareCache[key];
    result += `- Trường: ${info.university}, Ngành: ${info.major}, Thành phố: ${info.city}, Học phí: ${info.fee}, Khối thi: ${info.examBlocks.join(", ")}, Điểm chuẩn: ${info.scores
      .map((s) => `${s.year}: ${s.score}`)
      .join(", ")}\n`;
  }
  result += "Hãy sử dụng thông tin này để trả lời chi tiết về các ngành, so sánh, điểm chuẩn, học phí, hoặc trường nào phù hợp hơn.";
  return result;
};

const MessageBubble = ({ content, isUser, isSearching }: Message) => {
  if (isSearching) {
    return (
      <div style={styles.searchingIndicator}>
        <SearchOutlined />
        <span>Đang tìm kiếm thông tin...</span>
      </div>
    );
  }
  
  return (
    <div style={{ 
      ...styles.message(isUser), 
      wordWrap: 'break-word', 
      overflowWrap: 'break-word',
      whiteSpace: 'pre-wrap',
    }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <div style={{ margin: 0, padding: 0 }}>{children}</div>,
          table: ({ children }) => (
            <table style={{ 
              borderCollapse: 'collapse', 
              width: '100%', 
              margin: '10px 0',
              border: '1px solid #000000'
            }}>
              {children}
            </table>
          ),
          thead: ({ children }) => (
            <thead style={{ backgroundColor: '#e0e0e0', border: '1px solid #000000' }}>{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr style={{ backgroundColor: '#e0e0e0', border: '1px solid #000000' }}>
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th style={{ 
              border: '1px solid #000000', 
              padding: '12px 8px', 
              textAlign: 'center',
              fontWeight: 'bold',
              verticalAlign: 'middle'
            }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ 
              border: '1px solid #000000', 
              padding: '8px', 
              textAlign: 'left',
              verticalAlign: 'middle'
            }}>
              {children}
            </td>
          ),
        }}
      >
        {content.trim()}
      </ReactMarkdown>
    </div>
  );
};

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
  const [isSearching, setIsSearching] = useState(false);
  const [includeMajorCompare, setIncludeMajorCompare] = useState(true);


  const streamChat = useChatbot(
    (text: string) => {
      setLiveMessage((prev) => ({
        content: (prev?.content || "") + text,
        isUser: false,
      }));
    },
    (name: string, args: any) => {
      console.log(`Function call: ${name}`, args);
      
      if (name === "search_google") {
        setIsSearching(true);
        setMessages((prev) => [...prev, { 
          content: "", 
          isUser: false,
          isSearching: true
        }]);
      }
    },
    (name: string, response: any) => {
      console.log(`Function response: ${name}`, response);
      
      if (name === "search_google") {
        setIsSearching(false);
        setMessages((prev) => prev.filter(msg => !msg.isSearching));
      }
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

  let fullPrompt = message;

    if (includeMajorCompare) {
      if (Object.keys(majorCompareCache).length === 0) {
        setMessages((prev) => [
          ...prev,
          { content: message, isUser: true },
          {
            content: "Hiện tại không có thông tin về các ngành so sánh. Vui lòng thêm ngành để so sánh trước.",
            isUser: false,
          },
        ]);
        setMessage("");
        return;
      }
      fullPrompt = `${message}\n\n${formatMajorCompareCache()}`;
    }

    const displayUserMsg = { content: message, isUser: true };
    const aiInput = { content: fullPrompt, isUser: true };

    const updatedMessages = [...messages, displayUserMsg];
    setMessages(updatedMessages);
    hasAppended.current = false;

    streamChat([...messages, aiInput]);
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
            <div style={{ position: 'relative' }}>
              <TextArea
                disabled={isSearching}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                style={{ 
                  resize: "none",
                  height: "80px",
                  minHeight: "60px"
                }}
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
              <Switch
                checked={includeMajorCompare}
                onChange={(checked) => setIncludeMajorCompare(checked)}
                size="small"
                title="Bật/tắt thêm ngành so sánh"
                style={{
                  position: 'absolute',
                  right: 50,
                  bottom: 14,
                }}
              />
              <Button
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!message.trim() || isSearching}
                style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  backgroundColor: message.trim() ? '#1E894E' : '#d0e5d9',
                  border: 'none',
                  color: message.trim() ? 'white' : '#888',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </ConfigProvider>
  );
}