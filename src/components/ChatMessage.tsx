import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary/20 border border-secondary/40"
            : "bg-primary/20 border border-primary/40 glow-cyan"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-secondary" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-secondary/10 border border-secondary/20"
            : "bg-muted border border-border border-glow"
        }`}
      >
        {message.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "300ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "600ms" }} />
            </div>
            <span className="text-sm">{message.content}</span>
          </div>
        ) : (
          <>
            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-foreground prose-a:text-primary">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Generated image"
                className="mt-3 rounded-lg max-w-full border border-primary/20 glow-cyan"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
