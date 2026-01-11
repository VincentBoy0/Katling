import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getConversationHistory,
  sendChatMessage,
} from "@/services/chatService";
import {
  Bot,
  ChevronLeft,
  Mic,
  MicOff,
  Send,
  Sparkles,
  User,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! Mình là Katbot. Hôm nay bạn muốn luyện tập chủ đề gì nè? 😺",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (isTyping || !input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await sendChatMessage(input);

      const botMsg: Message = {
        id: Date.now() + 1,
        text: res.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: "Xin lỗi, mình gặp lỗi khi phản hồi 😿",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await getConversationHistory();
        const historyMessages: Message[] = res.history.map((h, i) => ({
          id: i + 1,
          text: h.content,
          sender: h.role === "assistant" ? "bot" : "user",
          timestamp: new Date(),
        }));
        setMessages(historyMessages);
      } catch {}
    }

    loadHistory();
  }, []);

  const handleQuickReply = (text: string) => {
    setInput(text);
  };

  const handleVoiceClick = () => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Trình duyệt không hỗ trợ thu âm giọng nói", {
        description: "Vui lòng sử dụng Chrome, Edge hoặc Safari.",
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    // Start recording
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "vi-VN"; // Default Vietnamese, also recognizes English

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Đang lắng nghe... 🎤", {
        description: "Nói xong hãy nhấn lại nút mic hoặc đợi tự động dừng.",
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);

      if (event.error === "not-allowed") {
        toast.error("Không có quyền truy cập microphone", {
          description:
            "Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.",
        });
      } else if (event.error === "no-speech") {
        toast.warning("Không nghe thấy giọng nói", {
          description: "Vui lòng thử lại và nói to hơn.",
        });
      } else {
        toast.error("Lỗi thu âm", {
          description: "Vui lòng thử lại.",
        });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      toast.error("Không thể bắt đầu thu âm");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-2rem)] md:h-screen bg-background flex flex-col items-center p-4 md:p-6 max-w-4xl mx-auto">
      {/* 1. HEADER */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:bg-muted rounded-xl"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center border-2 border-emerald-200 dark:border-emerald-800">
                <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
            </div>
            <div>
              <h1 className="font-black text-lg leading-none">Katbot AI</h1>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1 mt-1">
                <Sparkles className="w-3 h-3" />
                Đang trực tuyến
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHAT CONTAINER */}
      <Card className="flex-1 w-full border-2 border-border rounded-3xl overflow-hidden flex flex-col bg-card shadow-sm">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto border-2
                  ${
                    msg.sender === "user"
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800"
                  }
                `}
                >
                  {msg.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`
                    p-4 rounded-2xl border-2 shadow-sm text-sm md:text-base font-medium
                    ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground border-primary rounded-br-none"
                        : "bg-white dark:bg-slate-900 text-foreground border-border rounded-bl-none"
                    }
                  `}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold text-primary dark:text-primary">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-emerald-600 dark:text-emerald-400">
                            {children}
                          </em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2 space-y-1">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2 space-y-1">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="ml-2">{children}</li>
                        ),
                        code: ({ children }) => (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                            {children}
                          </code>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start w-full">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center shrink-0 mt-auto">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-white dark:bg-slate-900 border-2 border-border p-4 rounded-2xl rounded-bl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick Suggestions (Nếu chưa nhập gì) */}
        {messages.length < 3 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleQuickReply("Giúp tôi sửa lỗi ngữ pháp")}
              className="whitespace-nowrap px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 border border-secondary text-xs font-bold rounded-lg text-secondary-foreground transition-colors"
            >
              Sửa ngữ pháp
            </button>
            <button
              onClick={() => handleQuickReply("Hôm nay học từ vựng gì?")}
              className="whitespace-nowrap px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 border border-secondary text-xs font-bold rounded-lg text-secondary-foreground transition-colors"
            >
              Gợi ý từ vựng
            </button>
            <button
              onClick={() => handleQuickReply("Luyện hội thoại đi!")}
              className="whitespace-nowrap px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 border border-secondary text-xs font-bold rounded-lg text-secondary-foreground transition-colors"
            >
              Luyện hội thoại
            </button>
          </div>
        )}

        {/* 3. INPUT AREA */}
        <div className="p-4 bg-background border-t-2 border-border">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="pr-10 min-h-[3rem] py-3 rounded-xl border-2 border-border focus-visible:ring-0 focus-visible:border-primary font-medium bg-muted/20"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVoiceClick}
                className={`absolute right-2 top-1.5 hover:bg-transparent transition-colors ${
                  isRecording
                    ? "text-red-500 animate-pulse"
                    : "text-muted-foreground hover:text-primary"
                }`}
                title={
                  isRecording
                    ? "Đang thu âm... (Nhấn để dừng)"
                    : "Thu âm giọng nói"
                }
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </Button>
            </div>

            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:translate-y-[-2px] active:translate-y-0 transition-all border-primary-foreground/20"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </Button>
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              AI có thể mắc lỗi • Hãy kiểm chứng thông tin
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
