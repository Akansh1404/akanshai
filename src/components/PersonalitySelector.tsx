import { Personality, PERSONALITY_LABELS } from "@/types/chat";

interface PersonalitySelectorProps {
  personality: Personality;
  onChange: (p: Personality) => void;
}

const personalities = Object.keys(PERSONALITY_LABELS) as Personality[];

export function PersonalitySelector({ personality, onChange }: PersonalitySelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {personalities.map((p) => {
        const { label, emoji } = PERSONALITY_LABELS[p];
        const isActive = personality === p;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-body font-semibold transition-all duration-200 ${
              isActive
                ? "bg-primary/20 border border-primary/40 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title={PERSONALITY_LABELS[p].description}
          >
            <span>{emoji}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
