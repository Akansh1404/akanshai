export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageAttachment?: string; // base64 data URL of uploaded image
  videoUrl?: string;
  isLoading?: boolean;
  mode?: ChatMode;
};

export type ChatMode = "chat" | "research" | "image" | "video" | "math" | "grammar" | "quiz" | "flashcards" | "homework" | "jokes" | "facts" | "story" | "wouldyourather";

export type Personality = "default" | "teacher" | "study" | "funny" | "coding" | "gaming";

export const PERSONALITY_LABELS: Record<Personality, { label: string; emoji: string; description: string }> = {
  default: { label: "Default", emoji: "🤖", description: "Balanced & helpful" },
  teacher: { label: "Teacher", emoji: "👩‍🏫", description: "Patient & educational" },
  study: { label: "Study", emoji: "🤓", description: "Focused & structured" },
  funny: { label: "Funny", emoji: "😆", description: "Humorous & witty" },
  coding: { label: "Coding", emoji: "🧑‍💻", description: "Technical & precise" },
  gaming: { label: "Gaming", emoji: "🎮", description: "Casual & fun" },
};

export type AppLanguage =
  | "english" | "hindi" | "bengali" | "telugu" | "marathi" | "tamil"
  | "gujarati" | "kannada" | "malayalam" | "odia" | "punjabi" | "assamese"
  | "urdu" | "maithili" | "sanskrit" | "konkani" | "dogri" | "kashmiri"
  | "manipuri" | "bodo" | "santali" | "nepali" | "sindhi";

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  english: "English",
  hindi: "हिन्दी",
  bengali: "বাংলা",
  telugu: "తెలుగు",
  marathi: "मराठी",
  tamil: "தமிழ்",
  gujarati: "ગુજરાતી",
  kannada: "ಕನ್ನಡ",
  malayalam: "മലയാളം",
  odia: "ଓଡ଼ିଆ",
  punjabi: "ਪੰਜਾਬੀ",
  assamese: "অসমীয়া",
  urdu: "اردو",
  maithili: "मैथिली",
  sanskrit: "संस्कृतम्",
  konkani: "कोंकणी",
  dogri: "डोगरी",
  kashmiri: "कॉशुर",
  manipuri: "মৈতৈলোন্",
  bodo: "बर'",
  santali: "ᱥᱟᱱᱛᱟᱲᱤ",
  nepali: "नेपाली",
  sindhi: "سنڌي",
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
