import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Input } from "@/components/learner/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecorder } from "@/hooks/useRecorder";
import {
  getConversationHistory,
  getTextToSpeech,
  sendChatMessage,
  sendVoiceMessage,
} from "@/services/chatService";
import {
  Bot,
  ChevronLeft,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  Sparkles,
  Square,
  User,
  Volume2,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  audioUrl?: string; // URL for audio playback
  audioLang?: string; // Language for TTS
  userAudioUrl?: string; // URL for user's voice message playback
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
      audioLang: "vi",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const [userAudioPlaying, setUserAudioPlaying] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const { start: startRecorder, stop: stopRecorder } = useRecorder();

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

  // Play bot response audio
  const handlePlayAudio = async (message: Message) => {
    if (playingAudioId === message.id) {
      // Stop playing
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(message.id);

      // Get TTS audio
      const audioBlob = await getTextToSpeech(
        message.text,
        message.audioLang || "en"
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;

      audio.onended = () => {
        setPlayingAudioId(null);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setPlayingAudioId(null);
        URL.revokeObjectURL(audioUrl);
        toast.error("Không thể phát audio");
      };

      await audio.play();
    } catch (e) {
      console.error("Audio playback error:", e);
      setPlayingAudioId(null);
      toast.error("Không thể phát audio");
    }
  };

  // Voice chat - record and send audio
  const handleVoiceChat = async () => {
    if (isRecording) {
      // Stop recording and send
      try {
        const { wavBlob, webmBlob } = await stopRecorder();
        setIsRecording(false);

        // Create audio URL for playback (use webmBlob for better browser compatibility)
        const userAudioUrl = URL.createObjectURL(webmBlob);

        // Add user message with audio
        const userMsgId = Date.now();
        setMessages((prev) => [
          ...prev,
          {
            id: userMsgId,
            text: "",
            sender: "user",
            timestamp: new Date(),
            userAudioUrl: userAudioUrl,
          },
        ]);

        setIsTyping(true);

        // Send voice to server for AI response (voice mode requires English response)
        const res = await sendVoiceMessage(wavBlob, true);

        // Update user message with transcribed text (keep audio)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId ? { ...m, text: res.user_text || "" } : m
          )
        );

        // Add bot response
        const botMsg: Message = {
          id: Date.now() + 1,
          text: res.response_text,
          sender: "bot",
          timestamp: new Date(),
          audioLang: res.audio_lang,
        };

        setMessages((prev) => [...prev, botMsg]);

        // Auto-play bot response if in voice mode
        if (isVoiceMode && res.has_audio) {
          setTimeout(() => handlePlayAudio(botMsg), 500);
        }
      } catch (e) {
        console.error("Voice chat error:", e);
        toast.error("Lỗi gửi tin nhắn thoại");
        setIsRecording(false);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    // Start recording
    try {
      await startRecorder();
      setIsRecording(true);
      toast.info("Đang thu âm... 🎤", {
        description: "Nhấn lại nút mic để gửi tin nhắn.",
      });
    } catch (e) {
      console.error("Failed to start recording:", e);
      toast.error("Không thể bắt đầu thu âm", {
        description: "Vui lòng cho phép truy cập microphone.",
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioPlayerRef.current?.pause();
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
                <div className="flex flex-col gap-2">
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
                      <>
                        {/* User Voice Message with Custom Audio Player */}
                        {msg.userAudioUrl ? (
                          <div className="flex items-center gap-2 min-w-[180px]">
                            {/* Play/Pause Button */}
                            <button
                              onClick={() => {
                                const audio = document.getElementById(
                                  `user-audio-${msg.id}`
                                ) as HTMLAudioElement;
                                if (audio) {
                                  if (userAudioPlaying === msg.id) {
                                    audio.pause();
                                    setUserAudioPlaying(null);
                                  } else {
                                    // Stop other audio first
                                    if (userAudioRef.current) {
                                      userAudioRef.current.pause();
                                    }
                                    userAudioRef.current = audio;
                                    audio.play();
                                    setUserAudioPlaying(msg.id);
                                  }
                                }
                              }}
                              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shrink-0"
                            >
                              {userAudioPlaying === msg.id ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </button>

                            {/* Progress Bar */}
                            <div className="flex-1 flex flex-col gap-1">
                              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white/70 transition-all duration-100"
                                  style={{
                                    width:
                                      userAudioPlaying === msg.id
                                        ? `${audioProgress}%`
                                        : "0%",
                                  }}
                                />
                              </div>
                              <span className="text-[10px] opacity-70">
                                🎤 Voice
                              </span>
                            </div>

                            {/* Stop Button */}
                            <button
                              onClick={() => {
                                const audio = document.getElementById(
                                  `user-audio-${msg.id}`
                                ) as HTMLAudioElement;
                                if (audio) {
                                  audio.pause();
                                  audio.currentTime = 0;
                                  setUserAudioPlaying(null);
                                  setAudioProgress(0);
                                }
                              }}
                              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all shrink-0"
                            >
                              <Square className="w-3 h-3" />
                            </button>

                            {/* Hidden Audio Element */}
                            <audio
                              id={`user-audio-${msg.id}`}
                              src={msg.userAudioUrl}
                              className="hidden"
                              onTimeUpdate={(e) => {
                                const audio = e.currentTarget;
                                if (audio.duration) {
                                  setAudioProgress(
                                    (audio.currentTime / audio.duration) * 100
                                  );
                                }
                              }}
                              onEnded={() => {
                                setUserAudioPlaying(null);
                                setAudioProgress(0);
                              }}
                            />
                          </div>
                        ) : (
                          msg.text
                        )}
                      </>
                    )}
                  </div>

                  {/* Audio Play Button for Bot Messages - Only in Voice Mode */}
                  {isVoiceMode &&
                    msg.sender === "bot" &&
                    msg.text &&
                    !msg.text.startsWith("🎤") && (
                      <button
                        onClick={() => handlePlayAudio(msg)}
                        className={`self-start flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          playingAudioId === msg.id
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {playingAudioId === msg.id ? (
                          <>
                            <Pause className="w-3 h-3" />
                            Đang phát
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Nghe
                          </>
                        )}
                      </button>
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
          {/* Voice Mode Toggle */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isVoiceMode
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              {isVoiceMode ? "Chế độ thoại: BẬT" : "Chế độ thoại: TẮT"}
            </button>
          </div>

          <div className="flex items-end gap-2">
            {isVoiceMode ? (
              /* Voice Mode Input */
              <div className="flex-1 flex justify-center">
                <Button
                  onClick={handleVoiceChat}
                  disabled={isTyping}
                  className={`h-16 w-16 rounded-full transition-all ${
                    isRecording
                      ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {isTyping ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="w-8 h-8" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </Button>
              </div>
            ) : (
              /* Text Mode Input */
              <>
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
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceChat}
                    className={`absolute right-2 top-1.5 hover:bg-transparent transition-colors ${
                      isRecording
                        ? "text-red-500 animate-pulse"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                    title={
                      isRecording
                        ? "Đang thu âm... (Nhấn để gửi)"
                        : "Thu âm và gửi tin nhắn thoại"
                    }
                  >
                    {isRecording ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </Button> */}
                </div>

                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:translate-y-[-2px] active:translate-y-0 transition-all border-primary-foreground/20"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </Button>
              </>
            )}
          </div>

          <div className="text-center mt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {isVoiceMode
                ? "Nhấn nút để nói • Nhấn lại để gửi"
                : "AI có thể mắc lỗi • Hãy kiểm chứng thông tin"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
