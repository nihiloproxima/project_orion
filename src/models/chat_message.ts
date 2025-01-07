export interface ChatMessage {
    id: string;
    channel_id: string;
    sender_name: string;
    sender_avatar: string;
    type: "user_message" | "system_message";
    sender_id: string | null;
    text: string;
    created_at: number;
}
