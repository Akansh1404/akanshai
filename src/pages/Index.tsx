import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Bot, Trash2, Sparkles } from "lucide-react";

const Index = () => {
  const { messages, isLoading, send, clearChat } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-background bg-grid">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border border-glow px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground text-glow-cyan">
                AKANSH'S CHATBOT
              </h1>
              <p className="text-xs text-muted-foreground font-body tracking-wide">
                Powered by Gemini AI • Text & Image Generation
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all duration-200"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center glow-cyan">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-wider text-foreground text-glow-cyan mb-2">
                  WELCOME
                </h2>
                <p className="text-muted-foreground font-body text-lg max-w-md">
                  Ask me anything or generate images with <span className="text-primary font-semibold">/image</span> followed by your prompt.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {["What can you do?", "Tell me a joke", "/image a cyberpunk city at night"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="px-4 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200 font-body"
                  >
                    {suggestion}
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
      <div className="flex-shrink-0 border-t border-border border-glow px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={send} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
