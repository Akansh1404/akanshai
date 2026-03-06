export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  imageAttachment?: string; // base64 data URL of uploaded image
  videoUrl?: string;
  isLoading?: boolean;
  mode?: "chat" | "research" | "image" | "video";
};

export type ChatMode = "chat" | "research" | "image" | "video";

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};
