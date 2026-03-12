import { useState, useRef, useCallback, useEffect } from "react";
import { X, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import avatarImg from "@/assets/avatar.png";
import { toast } from "sonner";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`;
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function VideoCallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiText, setAiText] = useState("Press the call button to start talking");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);
  const handleUserSpeechRef = useRef<(text: string) => void>(() => {});
  const callActiveRef = useRef(false);

  // Setup speech recognition once
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn("SpeechRecognition not supported in this browser");
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (interim) setTranscript(interim);
      if (final) {
        setTranscript(final);
        handleUserSpeechRef.current(final.trim());
      }
    };
    recognition.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      if (callActiveRef.current) {
        try { recognition.start(); } catch {}
      }
    };
    recognitionRef.current = recognition;
    return () => { try { recognition.abort(); } catch {} };
  }, []);

  const handleUserSpeech = useCallback(async (text: string) => {
    if (!text || isProcessing) return;
    setIsProcessing(true);
    setTranscript("");
    console.log("User said:", text);

    conversationRef.current.push({ role: "user", content: text });

    try {
      // Get AI response (non-streaming for simplicity in voice call)
      const chatResp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: conversationRef.current.slice(-10),
          mode: "chat",
        }),
      });

      if (!chatResp.ok) throw new Error("Chat failed");

      // Parse streamed response fully
      let fullResponse = "";
      const reader = chatResp.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const p = JSON.parse(json);
            const c = p.choices?.[0]?.delta?.content;
            if (c) fullResponse += c;
          } catch {}
        }
      }

      if (!fullResponse) fullResponse = "I didn't catch that. Could you say that again?";

      conversationRef.current.push({ role: "assistant", content: fullResponse });
      setAiText(fullResponse.slice(0, 200) + (fullResponse.length > 200 ? "..." : ""));

      // Speak the response
      const plainText = fullResponse
        .replace(/#{1,6}\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[-*+]\s/g, "")
        .replace(/\n{2,}/g, ". ")
        .replace(/\n/g, " ")
        .trim()
        .slice(0, 3000);

      const ttsResp = await fetch(TTS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ text: plainText }),
      });

      if (ttsResp.ok) {
        const blob = await ttsResp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        await audio.play();
      }
    } catch (e: any) {
      toast.error("Voice call error");
      setAiText("Sorry, something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const startCall = useCallback(() => {
    setCallActive(true);
    setAiText("Listening...");
    conversationRef.current = [
      { role: "system", content: "You are Akansh's AI assistant on a voice call. Keep responses short and conversational, like a real phone call. Max 2-3 sentences." },
    ];
    try {
      recognitionRef.current?.start();
      setIsListening(true);
    } catch {}
  }, []);

  const endCall = useCallback(() => {
    setCallActive(false);
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setAiText("Call ended");
    setTranscript("");
    try { recognitionRef.current?.stop(); } catch {}
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    conversationRef.current = [];
  }, []);

  const toggleMic = useCallback(() => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
    } else {
      try { recognitionRef.current?.start(); } catch {}
      setIsListening(true);
    }
  }, [isListening]);

  useEffect(() => {
    if (!open) endCall();
  }, [open, endCall]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md flex flex-col items-center gap-6">
        {/* Close button */}
        <button
          onClick={() => { endCall(); onClose(); }}
          className="absolute top-0 right-0 w-10 h-10 rounded-full bg-muted/30 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className={`relative w-64 h-80 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${
          isSpeaking
            ? "border-primary shadow-[0_0_40px_rgba(0,255,255,0.4)] scale-[1.02]"
            : isProcessing
            ? "border-secondary/60 shadow-[0_0_20px_rgba(255,200,0,0.3)]"
            : callActive
            ? "border-primary/40 shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            : "border-border"
        }`}>
          <img
            src={avatarImg}
            alt="AI Avatar"
            className={`w-full h-full object-cover object-top transition-transform duration-1000 ${
              isSpeaking
                ? "animate-[avatar-speak_2s_ease-in-out_infinite]"
                : callActive
                ? "animate-[avatar-idle_4s_ease-in-out_infinite]"
                : ""
            }`}
          />

          {/* Speaking indicator overlay */}
          {isSpeaking && (
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none">
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="w-1 bg-primary rounded-full animate-[wave_1s_ease-in-out_infinite]"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      height: "12px",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && !isSpeaking && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "300ms" }} />
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: "600ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="font-display text-lg tracking-wider text-foreground text-glow-cyan">
            AKANSH SINGH
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs line-clamp-2">
            {aiText}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-muted/50 border border-border rounded-xl px-4 py-2 max-w-xs text-center">
            <p className="text-xs text-muted-foreground">You:</p>
            <p className="text-sm text-foreground">{transcript}</p>
          </div>
        )}

        {/* Call controls */}
        <div className="flex items-center gap-4">
          {callActive ? (
            <>
              <button
                onClick={toggleMic}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? "bg-primary/20 border-2 border-primary text-primary"
                    : "bg-muted border-2 border-border text-muted-foreground"
                }`}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button
                onClick={() => { endCall(); onClose(); }}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </>
          ) : (
            <button
              onClick={startCall}
              className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            >
              <Phone className="w-7 h-7" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
