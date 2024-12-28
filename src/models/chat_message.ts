export interface ChatMessage {
  id: string;
  channel_id: string;
  sender_name: string;
  type: "user_message" | "system_message";
  user_id: string | null;
  text: string;
  created_at: number;
}
