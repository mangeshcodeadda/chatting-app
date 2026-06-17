import { supabase } from "../api/supabase";

export async function findOrCreateChat(
  currentUserId,
  selectedUserId
) {

  const { data: myChats } =
    await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_id", currentUserId);

  const { data: otherChats } =
    await supabase
      .from("chat_participants")
      .select("chat_id")
      .eq("user_id", selectedUserId);

  const commonChat =
    myChats?.find(myChat =>
      otherChats?.some(
        otherChat =>
          otherChat.chat_id ===
          myChat.chat_id
      )
    );

  if (commonChat) {
    return commonChat.chat_id;
  }

  const { data: chat } =
    await supabase
      .from("chats")
      .insert({})
      .select()
      .single();

  await supabase
    .from("chat_participants")
    .insert([
      {
        chat_id: chat.id,
        user_id: currentUserId
      },
      {
        chat_id: chat.id,
        user_id: selectedUserId
      }
    ]);

  return chat.id;
}