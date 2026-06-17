import { supabase } from "../api/supabase";

export async function getMessages(
  chatId
) {

  const { data } =
    await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order(
        "created_at",
        {
          ascending: true
        }
      );

  return data || [];
}

export async function sendMessage(
  chatId,
  senderId,
  content
) {

  return await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content
    });

}

export async function markMessagesAsRead(
  chatId,
  currentUserId
) {

  const { data: messages } =
    await supabase
      .from("messages")
      .select("id,sender_id")
      .eq("chat_id", chatId);

  const unreadMessages =
    messages?.filter(
      m =>
        m.sender_id !==
        currentUserId
    ) || [];

  if (
    unreadMessages.length === 0
  ) {
    return;
  }

  const payload =
    unreadMessages.map(
      message => ({
        message_id:
          message.id,
        user_id:
          currentUserId
      })
    );

  await supabase
    .from("message_reads")
    .upsert(payload);
}