import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import { Bot, User, Image, Search, Video, Share2, Check, Copy, Volume2, VolumeX, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
}

const modeIcons: Record<string, typeof Bot> = {
  research: Search,
  image: Image,
  video: Video,
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const ModeIcon = !isUser && message.mode ? modeIcons[message.mode] || Bot : isUser ? User : Bot;
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async () => {
    // If already playing, stop
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      // Strip markdown for cleaner speech
      const plainText = message.content
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[-*+]\s/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim();

      if (!plainText) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: plainText.slice(0, 5000) }),
        }
      );

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      setIsSpeaking(true);
      await audio.play();
    } catch (e: any) {
      toast.error("Voice playback failed");
      setIsSpeaking(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const { data, error } = await supabase.from("shared_responses").insert({
        message_content: message.content,
        image_url: message.imageUrl || null,
        mode: message.mode || "chat",
        original_prompt: null,
      }).select("id").single();

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${data.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Share link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (e: any) {
      toast.error("Failed to create share link");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-secondary/20 border border-secondary/40"
            : message.mode === "research"
            ? "bg-neon-green/20 border border-neon-green/40"
            : message.mode === "video"
            ? "bg-neon-purple/20 border border-neon-purple/40"
            : "bg-primary/20 border border-primary/40 glow-cyan"
        }`}
      >
        <ModeIcon className={`w-4 h-4 ${
          isUser ? "text-secondary"
            : message.mode === "research" ? "text-neon-green"
            : message.mode === "video" ? "text-neon-purple"
            : "text-primary"
        }`} />
      </div>

      <div className="max-w-[80%] relative">
        <div
          className={`rounded-2xl px-4 py-3 ${
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
              {message.mode === "research" && !isUser && (
                <div className="text-xs text-neon-green font-display tracking-wider mb-2 flex items-center gap-1">
                  <Search className="w-3 h-3" /> DEEP RESEARCH
                </div>
              )}
              {message.mode === "video" && !isUser && (
                <div className="text-xs text-neon-purple font-display tracking-wider mb-2 flex items-center gap-1">
                  <Video className="w-3 h-3" /> VIDEO CONCEPT
                </div>
              )}
              {/* Show uploaded image */}
              {isUser && message.imageAttachment && (
                <img
                  src={message.imageAttachment}
                  alt="Uploaded"
                  className="mb-2 rounded-lg max-w-full max-h-48 border border-secondary/20"
                />
              )}
              <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-foreground prose-a:text-primary">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="Generated content"
                  className={`mt-3 rounded-lg max-w-full border ${
                    message.mode === "video"
                      ? "border-neon-purple/20"
                      : "border-primary/20 glow-cyan"
                  }`}
                />
              )}
            </>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && !message.isLoading && (
          <div className="absolute -bottom-3 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={handleSpeak}
              disabled={isLoadingAudio}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted border border-border text-xs text-muted-foreground hover:text-primary"
            >
              {isLoadingAudio ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isSpeaking ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              {isLoadingAudio ? "Loading..." : isSpeaking ? "Stop" : "Listen"}
            </button>
            <button
              onClick={handleShare}
              disabled={sharing}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted border border-border text-xs text-muted-foreground hover:text-primary"
            >
              {copied ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
              {copied ? "Copied!" : "Share"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
