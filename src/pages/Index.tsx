import { useRef, useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/components/ChatMessage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/ChatInput";
import { PersonalitySelector } from "@/components/PersonalitySelector";
import { ChatSidebar } from "@/components/ChatSidebar";
import { VideoCallModal } from "@/components/VideoCallModal";
import { Bot, Sparkles, Menu, X, ImagePlus, Search, Video, MessageSquare, PhoneCall } from "lucide-react";

const Index = () => {
  const {
    messages, isLoading, send, clearChat,
    mode, setMode,
    language, setLanguage,
    personality, setPersonality,
    conversations, loadConversation, startNewChat, deleteConvo,
    activeConvoId,
  } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-screen bg-background bg-grid">
      {/* Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConvoId}
        onSelect={loadConversation}
        onNew={startNewChat}
        onDelete={deleteConvo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 border-b border-border border-glow px-4 md:px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-sm md:text-lg font-bold tracking-wider text-foreground text-glow-cyan">
                  AKANSH'S CHATBOT
                </h1>
                <p className="text-xs text-muted-foreground font-body tracking-wide">
                  Chat • Research • Image • Video
                </p>
              </div>
              <PersonalitySelector personality={personality} onChange={setPersonality} />
              <LanguageSelector language={language} onChange={setLanguage} />
              <button
                onClick={() => setVideoCallOpen(true)}
                className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/40 flex items-center justify-center hover:bg-green-500/30 transition-all group/call"
                title="Video Call with AI"
              >
                <PhoneCall className="w-5 h-5 text-green-400 group-hover/call:text-green-300" />
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-6 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl md:text-2xl font-bold tracking-wider text-foreground text-glow-cyan mb-2">
                    WELCOME
                  </h2>
                  <p className="text-muted-foreground font-body text-base md:text-lg max-w-md">
                    Choose a mode below and ask me anything.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2 max-w-sm w-full">
                  {[
                    { icon: MessageSquare, label: "Chat", text: "What can you do?", color: "text-primary border-primary/20" },
                    { icon: Search, label: "Deep Research", text: "/research quantum computing", color: "text-neon-green border-neon-green/20" },
                    { icon: ImagePlus, label: "Generate Image", text: "/image cyberpunk city", color: "text-secondary border-secondary/20" },
                    { icon: Video, label: "Video Concept", text: "/video ocean sunset drone", color: "text-neon-purple border-neon-purple/20" },
                  ].map((item) => (
                    <button
                      key={item.text}
                      onClick={() => send(item.text)}
                      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-muted border ${item.color} text-sm hover:bg-muted/80 transition-all duration-200 font-body`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-border border-glow px-4 md:px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={send} isLoading={isLoading} mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </div>

      <VideoCallModal open={videoCallOpen} onClose={() => setVideoCallOpen(false)} />
    </div>
  );
};

export default Index;
