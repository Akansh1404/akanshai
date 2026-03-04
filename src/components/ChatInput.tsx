import { useState, FormEvent, useCallback } from "react";
import { Send, ImagePlus, Mic, MicOff, Search, Video } from "lucide-react";
import { ChatMode } from "@/types/chat";
import { useVoiceInput } from "@/hooks/use-voice-input";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modeConfig: Record<ChatMode, { icon: typeof Send; label: string; prefix: string; color: string }> = {
  chat: { icon: Send, label: "Chat", prefix: "", color: "text-primary" },
  research: { icon: Search, label: "Research", prefix: "/research ", color: "text-neon-green" },
  image: { icon: ImagePlus, label: "Image", prefix: "/image ", color: "text-secondary" },
  video: { icon: Video, label: "Video", prefix: "/video ", color: "text-neon-purple" },
};

export function ChatInput({ onSend, isLoading, mode, onModeChange }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleVoiceResult = useCallback((text: string) => {
    const prefix = modeConfig[mode].prefix;
    onSend(prefix + text);
  }, [mode, onSend]);

  const { isListening, toggleListening, isSupported } = useVoiceInput(handleVoiceResult);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const cycleMode = () => {
    const modes: ChatMode[] = ["chat", "research", "image", "video"];
    const idx = modes.indexOf(mode);
    const next = modes[(idx + 1) % modes.length];
    onModeChange(next);
    setInput("");
  };

  const currentConfig = modeConfig[mode];
  const placeholder = isLoading
    ? "Generating..."
    : mode === "chat"
    ? "Type a message..."
    : mode === "research"
    ? "Enter a topic to research deeply..."
    : mode === "image"
    ? "Describe the image you want..."
    : "Describe the video scene...";

  return (
    <div className="space-y-2">
      {/* Mode selector */}
      <div className="flex gap-1">
        {(Object.keys(modeConfig) as ChatMode[]).map((m) => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => { onModeChange(m); setInput(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body font-semibold tracking-wide transition-all duration-200 ${
                isActive
                  ? `bg-muted border border-primary/30 ${cfg.color}`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        {/* Voice button */}
        {isSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 ${
              isListening
                ? "bg-destructive/20 border-destructive/40 text-destructive animate-pulse-glow"
                : "bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary/40"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        )}

        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 disabled:opacity-50 font-body"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed glow-cyan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
