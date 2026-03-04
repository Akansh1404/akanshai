export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isLoading?: boolean;
};
