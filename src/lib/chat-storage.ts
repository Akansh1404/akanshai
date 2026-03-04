import { Conversation } from "@/types/chat";

const STORAGE_KEY = "akansh-chatbot-history";

export function loadConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function deleteConversation(id: string) {
  const convos = loadConversations().filter(c => c.id !== id);
  saveConversations(convos);
  return convos;
}
