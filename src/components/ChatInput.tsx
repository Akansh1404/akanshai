import { useState, FormEvent } from "react";
import { Send, ImagePlus } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  const handleImageMode = () => {
    if (!input.trim()) {
      setInput("/image ");
    } else if (!input.startsWith("/image ")) {
      setInput("/image " + input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <button
        type="button"
        onClick={handleImageMode}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-secondary hover:border-secondary/40 transition-all duration-200"
        title="Generate image (prefix with /image)"
      >
        <ImagePlus className="w-4 h-4" />
      </button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Generating..." : "Type a message or /image <prompt>..."}
          disabled={isLoading}
          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:glow-cyan transition-all duration-200 disabled:opacity-50 font-body"
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
  );
}
