import { AppLanguage, LANGUAGE_LABELS } from "@/types/chat";
import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  language: AppLanguage;
  onChange: (lang: AppLanguage) => void;
}

export function LanguageSelector({ language, onChange }: LanguageSelectorProps) {
  return (
    <Select value={language} onValueChange={(v) => onChange(v as AppLanguage)}>
      <SelectTrigger className="w-auto gap-1.5 h-8 px-2 text-xs bg-muted border-border rounded-lg font-body">
        <Globe className="w-3 h-3 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {(Object.keys(LANGUAGE_LABELS) as AppLanguage[]).map((lang) => (
          <SelectItem key={lang} value={lang} className="text-xs font-body">
            {LANGUAGE_LABELS[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
