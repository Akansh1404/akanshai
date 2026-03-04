import { useState, useCallback, useRef } from "react";
import { Message } from "@/types/chat";
import { streamChat, generateImage } from "@/lib/chat-api";
import { toast } from "sonner";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const idCounter = useRef(0);

  const genId = () => `msg-${++idCounter.current}-${Date.now()}`;

  const send = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const isImageRequest = trimmed.toLowerCase().startsWith("/image ");
    const userMsg: Message = { id: genId(), role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    if (isImageRequest) {
      const prompt = trimmed.slice(7).trim();
      const assistantId = genId();
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "🎨 Generating image...", isLoading: true }]);

      try {
        const result = await generateImage(prompt);
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: result.text || "Here's your image!", imageUrl: result.imageUrl, isLoading: false }
              : m
          )
        );
      } catch (e: any) {
        toast.error(e.message || "Image generation failed");
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: "❌ Image generation failed. Please try again.", isLoading: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Text chat with streaming
    let assistantSoFar = "";
    const assistantId = genId();

    const conversationHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      await streamChat({
        messages: conversationHistory,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) {
              return prev.map(m => m.id === assistantId ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, send, clearChat };
}
