import { useState, FormEvent, useCallback, useRef } from "react";
import { Send, ImagePlus, Mic, MicOff, Search, Video, Camera, Paperclip, X, Calculator, SpellCheck, HelpCircle, Layers, BookOpen, Laugh, Lightbulb, BookText, Shuffle } from "lucide-react";
import { ChatMode } from "@/types/chat";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string, imageAttachment?: string) => void;
  isLoading: boolean;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

const modeConfig: Record<ChatMode, { icon: typeof Send; label: string; prefix: string; color: string; group: "core" | "edu" }> = {
  chat: { icon: Send, label: "Chat", prefix: "", color: "text-primary", group: "core" },
  research: { icon: Search, label: "Research", prefix: "/research ", color: "text-neon-green", group: "core" },
  image: { icon: ImagePlus, label: "Image", prefix: "/image ", color: "text-secondary", group: "core" },
  video: { icon: Video, label: "Video", prefix: "/video ", color: "text-neon-purple", group: "core" },
  math: { icon: Calculator, label: "Math", prefix: "/math ", color: "text-primary", group: "edu" },
  grammar: { icon: SpellCheck, label: "Grammar", prefix: "/grammar ", color: "text-neon-green", group: "edu" },
  quiz: { icon: HelpCircle, label: "Quiz", prefix: "/quiz ", color: "text-secondary", group: "edu" },
  flashcards: { icon: Layers, label: "Cards", prefix: "/flashcards ", color: "text-neon-purple", group: "edu" },
  homework: { icon: BookOpen, label: "HW Help", prefix: "/homework ", color: "text-primary", group: "edu" },
  jokes: { icon: Laugh, label: "Jokes", prefix: "/jokes ", color: "text-secondary", group: "fun" },
  facts: { icon: Lightbulb, label: "Facts", prefix: "/facts ", color: "text-neon-green", group: "fun" },
  story: { icon: BookText, label: "Story", prefix: "/story ", color: "text-primary", group: "fun" },
  wouldyourather: { icon: Shuffle, label: "WYR", prefix: "/wyr ", color: "text-neon-purple", group: "fun" },
};

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_INPUT_LENGTH = 4000;

export function ChatInput({ onSend, isLoading, mode, onModeChange }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleVoiceResult = useCallback((text: string) => {
    const prefix = modeConfig[mode].prefix;
    onSend(prefix + text);
  }, [mode, onSend]);

  const { isListening, toggleListening, isSupported } = useVoiceInput(handleVoiceResult);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image must be under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imagePreview) || isLoading) return;
    onSend(input || "What's in this image?", imagePreview || undefined);
    setInput("");
    setImagePreview(null);
  };

  const placeholders: Partial<Record<ChatMode, string>> = {
    chat: "Type a message...",
    research: "Enter a topic to research deeply...",
    image: "Describe the image you want...",
    video: "Describe the video scene...",
    math: "Enter a math problem to solve...",
    grammar: "Paste text to check grammar...",
    quiz: "Enter a topic to generate a quiz...",
    flashcards: "Enter a topic for flashcards...",
    homework: "Describe your homework question...",
    jokes: "Enter a topic for jokes...",
    facts: "Enter a topic for random facts...",
    story: "Describe a story idea or genre...",
    wouldyourather: "Enter a topic for Would You Rather...",
  };
  const placeholder = isLoading ? "Generating..." : placeholders[mode] || "Type a message...";

  return (
    <div className="space-y-2">
      {/* Mode selector */}
      <div className="flex gap-1 flex-wrap">
        {(Object.keys(modeConfig) as ChatMode[]).filter(m => modeConfig[m].group === "core").map((m) => {
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
        <span className="text-muted-foreground/40 self-center text-xs">|</span>
        {(Object.keys(modeConfig) as ChatMode[]).filter(m => modeConfig[m].group === "edu").map((m) => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => { onModeChange(m); setInput(""); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold tracking-wide transition-all duration-200 ${
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
        <span className="text-muted-foreground/40 self-center text-xs">|</span>
        {(Object.keys(modeConfig) as ChatMode[]).filter(m => modeConfig[m].group === "fun").map((m) => {
          const cfg = modeConfig[m];
          const Icon = cfg.icon;
          const isActive = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => { onModeChange(m); setInput(""); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold tracking-wide transition-all duration-200 ${
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

      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img src={imagePreview} alt="Upload preview" className="h-20 rounded-lg border border-primary/30" />
          <button
            type="button"
            onClick={() => setImagePreview(null)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 rounded-xl border bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all duration-200"
          title="Upload image"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Camera button */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-shrink-0 w-10 h-10 rounded-xl border bg-muted border-border text-muted-foreground hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all duration-200"
          title="Take photo"
        >
          <Camera className="w-4 h-4" />
        </button>

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
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={MAX_INPUT_LENGTH}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all duration-200 disabled:opacity-50 font-body"
          />
        </div>

        <button
          type="submit"
          disabled={(!input.trim() && !imagePreview) || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed glow-cyan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      {input.length > MAX_INPUT_LENGTH * 0.8 && (
        <p className="text-xs text-muted-foreground text-right font-body">
          {input.length}/{MAX_INPUT_LENGTH}
        </p>
      )}
    </div>
  );
}
