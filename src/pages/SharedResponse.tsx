import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Bot, ArrowLeft, Search, Video } from "lucide-react";

const SharedResponse = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("shared_responses")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (!error) setData(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center">
        <div className="flex gap-1">
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "300ms" }} />
          <span className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "600ms" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground font-body">Shared response not found.</p>
        <Link to="/" className="text-primary font-body hover:underline">← Back to chatbot</Link>
      </div>
    );
  }

  const modeLabel = data.mode === "research" ? "DEEP RESEARCH" : data.mode === "video" ? "VIDEO CONCEPT" : "AI RESPONSE";
  const ModeIcon = data.mode === "research" ? Search : data.mode === "video" ? Video : Bot;
  const modeColor = data.mode === "research" ? "text-neon-green" : data.mode === "video" ? "text-neon-purple" : "text-primary";

  return (
    <div className="min-h-screen bg-background bg-grid">
      <header className="border-b border-border border-glow px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link to="/" className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center glow-cyan">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-wider text-foreground text-glow-cyan">
              AKANSH'S CHATBOT
            </h1>
            <p className="text-xs text-muted-foreground font-body">Shared Response</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className={`text-xs font-display tracking-wider mb-3 flex items-center gap-1 ${modeColor}`}>
          <ModeIcon className="w-3 h-3" /> {modeLabel}
        </div>
        <div className="bg-muted border border-border border-glow rounded-2xl px-6 py-5">
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:text-foreground prose-a:text-primary">
            <ReactMarkdown>{data.message_content}</ReactMarkdown>
          </div>
          {data.image_url && (
            <img src={data.image_url} alt="Generated" className="mt-4 rounded-lg max-w-full border border-primary/20" />
          )}
        </div>
        <div className="mt-6 text-center">
          <Link to="/" className="text-primary font-body text-sm hover:underline">Try Akansh's Chatbot →</Link>
        </div>
      </div>
    </div>
  );
};

export default SharedResponse;
