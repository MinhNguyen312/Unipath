import { useState, useRef, useEffect } from "react";
import { Button, Input, ConfigProvider, Alert } from "antd";
import { MessageOutlined, CloseOutlined, ReloadOutlined, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useChatbot } from "../../hooks/useChatbot";
import ReactMarkdown from "react-markdown";
import { SendOutlined } from "@ant-design/icons";
import { majorCompareStore } from "../../hooks/useCompareStore";
import remarkGfm from 'remark-gfm';
const { TextArea } = Input;
import { Switch } from 'antd'


interface Message {
  content: string | null;
  isUser: boolean;
  isSearching?: boolean;
  functionCall: JSON | null;
  functionResponse: JSON | null;
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
  },
  errorPopup: {
    position: "fixed" as const,
    bottom: 180,
    right: 110,
    backgroundColor: "#fff1f0",
    border: "1px solid #ffa39e",
    color: "#cf1322",
    padding: "10px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 2000,
    textAlign: "center" as const,
    maxWidth: 300,
    width: "calc(100vw - 48px)",
  },
  errorCloseButton: {
    marginTop: 10,
    backgroundColor: "#cf1322",
    color: "white",
    border: "none",
    padding: "4px 12px",
    borderRadius: 4,
    cursor: "pointer" as const,
  },
};

const ErrorPopup = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    console.log("ErrorPopup displayed, starting 5-second timer");
    const timer = setTimeout(() => {
      console.log("Auto-closing ErrorPopup after 5 seconds");
      onClose();
    }, 5000); // 5 giây

    return () => {
      console.log("Cleaning up ErrorPopup timer");
      clearTimeout(timer);
    };
  }, [onClose]);

  return (
      <Alert
        message={message}
        type="error"
        showIcon
        closable
        onClose={onClose}
        style={styles.errorPopup}
    />
  );
};

const formatMajorCompareCache = (): string => {
  if (Object.keys(majorCompareStore).length === 0) {
    return "Không có thông tin về các ngành đang so sánh.";
  }

  let result = "Thông tin về các ngành đang so sánh:\n";
  for (const key in majorCompareStore) {
    const info = majorCompareStore[key];
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
        {content?.trim()}
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
      <MessageBubble
        content="Xin chào, tôi là Unibot - chuyên gia tư vấn tuyển sinh đại học và kỳ thi THPT quốc gia, tôi có thể giúp gì cho bạn?"
        isUser={false}
        isSearching={false}
        functionCall={null}
        functionResponse={null}
      />
      {messages.map((msg, idx) => {
        const isLast = idx === messages.length - 1;
        if (msg.content !== null || (msg.isSearching && isLast)) {
          return <MessageBubble key={idx} {...msg} />;
        }
        return null;
      })}
      {liveMessage?.content !== null && liveMessage && (
        <MessageBubble {...liveMessage} />
      )}
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
  const [includeMajorCompare, setIncludeMajorCompare] = useState(false);
  const [showError, setShowError] = useState(false);


  const streamChat = useChatbot(
    (text: string) => {
      setLiveMessage((prev) => ({
        content: (prev?.content || "") + text,
        isUser: false,
        functionCall: null,
        functionResponse: null,
      }));
    },
    (name: string, args: any) => {
      console.log(`Function call: ${name}`, args);
      if (name === "search_google") {
        setIsSearching(true);
        setMessages((prev) => {
          return [...prev, { 
            content: null, 
            isUser: false,
            isSearching: true,
            functionCall: JSON.parse(JSON.stringify({ name, args })),
            functionResponse: null,
          }];
        });
        hasAppended.current = false;
      }
    },
    (name: string, response: any) => {
      console.log(`Function response: ${name}`, response);
      if (name === "search_google") {
        setIsSearching(false);
        const botMsg = {
          content: null,
          isUser: false,
          isSearching: false,
          functionCall: null,
          functionResponse: JSON.parse(JSON.stringify({ name, response })),
        };
        setMessages((prev) => [...prev, botMsg]);
        hasAppended.current = false;
      }
    },
    () => {
      setLiveMessage((msg) => {
        if (msg && !hasAppended.current) {
          setMessages((prev) => [...prev, msg]);
          hasAppended.current = true;
        }
        setIsComposing(false);
        setIsSearching(false);
        return null;
      });
    },
    () => {
      setMessages((prev) => [
        ...prev,
        { content: "Hiện tại tôi không thể trả lời, hãy thử lại!", isUser: false, functionCall: null, functionResponse: null },
      ]);
      setLiveMessage(null);
      setIsSearching(false);
      setIsComposing(false);
    },
    () => {
      console.log("onRateLimitError called: Error 429 detected");
      setShowError(true); // Hiển thị thông báo lỗi
      console.log("Error popup triggered for 429 error");
      setIsSearching(false);
      setIsComposing(false);
      console.log("Reset isSearching and isComposing after 429 error");
    }
  );

  const handleSend = () => {
  setIsComposing(true);
  if (!message.trim()) return;

  let fullPrompt = message;

    if (includeMajorCompare) {

      fullPrompt = `${message}\n\n${formatMajorCompareCache()}`;
    }

    const displayUserMsg = { content: message, isUser: true, functionCall: null, functionResponse: null };
    const aiInput = { content: fullPrompt, isUser: true, functionCall: null, functionResponse: null };

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

  const handleCloseError = () => {
    setShowError(false);
    console.log("Error popup closed manually");
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
                  bottom: 105,
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
      {showError && (
        <ErrorPopup
          message="Vui lòng thử lại sau!"
          onClose={handleCloseError}
        />
      )}
    </ConfigProvider>
  );
}