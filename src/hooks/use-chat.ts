import { useState, useCallback, useRef, useEffect } from "react";
import { Message, ChatMode, Conversation, AppLanguage } from "@/types/chat";
import { streamChat, generateImage, generateVideo } from "@/lib/chat-api";
import { loadConversations, saveConversations } from "@/lib/chat-storage";
import { toast } from "sonner";

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("chat");
  const [language, setLanguage] = useState<AppLanguage>("english");
  const idCounter = useRef(0);

  const genId = () => `msg-${++idCounter.current}-${Date.now()}`;
  const genConvoId = () => `convo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Persist messages to conversation
  useEffect(() => {
    if (!activeConvoId || messages.length === 0) return;
    const persistable = messages.filter(m => !m.isLoading);
    if (persistable.length === 0) return;

    setConversations(prev => {
      const updated = prev.map(c =>
        c.id === activeConvoId
          ? { ...c, messages: persistable, updatedAt: Date.now() }
          : c
      );
      saveConversations(updated);
      return updated;
    });
  }, [messages, activeConvoId]);

  const loadConversation = useCallback((id: string) => {
    const convo = conversations.find(c => c.id === id);
    if (convo) {
      setActiveConvoId(id);
      setMessages(convo.messages);
    }
  }, [conversations]);

  const startNewChat = useCallback(() => {
    setActiveConvoId(null);
    setMessages([]);
  }, []);

  const deleteConvo = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    if (activeConvoId === id) {
      setActiveConvoId(null);
      setMessages([]);
    }
  }, [activeConvoId]);

  const send = useCallback(async (input: string, imageAttachment?: string) => {
    const trimmed = input.trim();
    if ((!trimmed && !imageAttachment) || isLoading) return;

    // Detect mode from prefix
    let currentMode = mode;
    let actualContent = trimmed;
    if (trimmed.toLowerCase().startsWith("/image ")) {
      currentMode = "image";
      actualContent = trimmed.slice(7).trim();
    } else if (trimmed.toLowerCase().startsWith("/research ")) {
      currentMode = "research";
      actualContent = trimmed.slice(10).trim();
    } else if (trimmed.toLowerCase().startsWith("/video ")) {
      currentMode = "video";
      actualContent = trimmed.slice(7).trim();
    }

    const userMsg: Message = {
      id: genId(),
      role: "user",
      content: trimmed,
      mode: currentMode,
      imageAttachment,
    };

    // Create conversation if needed
    let convoId = activeConvoId;
    if (!convoId) {
      convoId = genConvoId();
      const title = trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "");
      const newConvo: Conversation = { id: convoId, title, messages: [], createdAt: Date.now(), updatedAt: Date.now() };
      setConversations(prev => {
        const updated = [newConvo, ...prev];
        saveConversations(updated);
        return updated;
      });
      setActiveConvoId(convoId);
    }

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    if (currentMode === "image") {
      const assistantId = genId();
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "🎨 Generating image...", isLoading: true, mode: "image" }]);
      try {
        const result = await generateImage(actualContent);
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: result.text || "Here's your image!", imageUrl: result.imageUrl, isLoading: false } : m));
      } catch (e: any) {
        toast.error(e.message || "Image generation failed");
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "❌ Image generation failed.", isLoading: false } : m));
      } finally { setIsLoading(false); }
      return;
    }

    if (currentMode === "video") {
      const assistantId = genId();
      setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "🎬 Generating video concept...", isLoading: true, mode: "video" }]);
      try {
        const result = await generateVideo(actualContent);
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: result.text || "Here's your video concept!", imageUrl: result.imageUrl, isLoading: false, mode: "video" } : m));
      } catch (e: any) {
        toast.error(e.message || "Video generation failed");
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "❌ Video generation failed.", isLoading: false } : m));
      } finally { setIsLoading(false); }
      return;
    }

    // Streaming text (chat or research)
    let assistantSoFar = "";
    const assistantId = genId();

    // Build conversation history with image support (cap at last 20 messages)
    const recentMessages = [...messages, userMsg].slice(-20);
    const conversationHistory = recentMessages.map(m => {
      if (m.imageAttachment) {
        return {
          role: m.role,
          content: [
            { type: "text" as const, text: m.content || "What's in this image?" },
            { type: "image_url" as const, image_url: { url: m.imageAttachment } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    try {
      await streamChat({
        messages: conversationHistory,
        mode: currentMode,
        language,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.id === assistantId) {
              return prev.map(m => m.id === assistantId ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { id: assistantId, role: "assistant", content: assistantSoFar, mode: currentMode }];
          });
        },
        onDone: () => setIsLoading(false),
      });
    } catch (e: any) {
      toast.error(e.message || "Chat failed");
      setIsLoading(false);
    }
  }, [messages, isLoading, mode, language, activeConvoId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveConvoId(null);
  }, []);

  return {
    messages, isLoading, send, clearChat,
    mode, setMode,
    conversations, loadConversation, startNewChat, deleteConvo,
    activeConvoId,
  };
}
