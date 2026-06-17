import {
  useEffect,
  useRef,
  useState
} from "react";

import { supabase } from "../api/supabase";

import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";

import MessageInput from "./MessageInput";

import {
  markMessagesAsRead
} from "../services/messageService";

function ChatWindow({
  selectedUser
}) {

  const { user } =
    useAuth();

  const [chatId, setChatId] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [isTyping,
    setIsTyping] =
    useState(false);

  const messagesEndRef =
    useRef(null);

  const typingChannelRef =
    useRef(null);

  const onlineUsers =
    usePresence(
      "global-online",
      user
    );

  const isOnline =
    onlineUsers.some(
      onlineUser =>
        onlineUser.id ===
        selectedUser?.id
    );

  useEffect(() => {

    if (
      selectedUser &&
      user
    ) {
      initializeChat();
    }

  }, [selectedUser]);

  useEffect(() => {

    if (!chatId) return;

    const messageChannel =
      supabase
        .channel(
          `messages-${chatId}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter:
              `chat_id=eq.${chatId}`
          },
          payload => {

            setMessages(
              current => [
                ...current,
                payload.new
              ]
            );

          }
        )
        .subscribe();

    return () => {

      supabase.removeChannel(
        messageChannel
      );

    };

  }, [chatId]);

  useEffect(() => {

    if (!chatId) return;

    const typingChannel =
      supabase.channel(
        `typing-${chatId}`
      );

    typingChannelRef.current =
      typingChannel;

    typingChannel
      .on(
        "broadcast",
        {
          event: "typing"
        },
        payload => {

          if (
            payload.payload
              .userId !==
            user.id
          ) {

            setIsTyping(
              true
            );

            setTimeout(
              () =>
                setIsTyping(
                  false
                ),
              1500
            );

          }

        }
      )
      .subscribe();

    return () => {

      supabase.removeChannel(
        typingChannel
      );

    };

  }, [chatId]);

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({
        behavior:
          "smooth"
      });

  }, [messages]);

  const initializeChat =
    async () => {

      const {
        data: myChats
      } =
        await supabase
          .from(
            "chat_participants"
          )
          .select(
            "chat_id"
          )
          .eq(
            "user_id",
            user.id
          );

      const {
        data: otherChats
      } =
        await supabase
          .from(
            "chat_participants"
          )
          .select(
            "chat_id"
          )
          .eq(
            "user_id",
            selectedUser.id
          );

      const commonChat =
        myChats.find(
          myChat =>
            otherChats.some(
              otherChat =>
                otherChat.chat_id ===
                myChat.chat_id
            )
        );

      let currentChatId;

      if (commonChat) {

        currentChatId =
          commonChat.chat_id;

      } else {

        const {
          data: chat
        } =
          await supabase
            .from("chats")
            .insert({})
            .select()
            .single();

        currentChatId =
          chat.id;

        await supabase
          .from(
            "chat_participants"
          )
          .insert([
            {
              chat_id:
                currentChatId,
              user_id:
                user.id
            },
            {
              chat_id:
                currentChatId,
              user_id:
                selectedUser.id
            }
          ]);

      }

      setChatId(
        currentChatId
      );

      await loadMessages(
        currentChatId
      );

      await markMessagesAsRead(
        currentChatId,
        user.id
      );

    };

  const loadMessages =
    async (
      currentChatId
    ) => {

      const { data } =
        await supabase
          .from("messages")
          .select("*")
          .eq(
            "chat_id",
            currentChatId
          )
          .order(
            "created_at",
            {
              ascending:
                true
            }
          );

      setMessages(
        data || []
      );

    };

  const sendMessage =
    async (content) => {

      await supabase
        .from("messages")
        .insert({
          chat_id:
            chatId,
          sender_id:
            user.id,
          content
        });

    };

  const sendTypingEvent =
    async () => {

      if (
        !typingChannelRef.current
      ) {
        return;
      }

      typingChannelRef.current.send(
        {
          type:
            "broadcast",
          event:
            "typing",
          payload: {
            userId:
              user.id
          }
        }
      );

    };

  if (!selectedUser) {

    return (
      <h2>
        Select a user
      </h2>
    );

  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection:
          "column",
        height: "100%"
      }}
    >

      <div>

        <h2>
          {
            selectedUser.username
          }
        </h2>

        <small>
          {isOnline
            ? "🟢 Online"
            : "⚫ Offline"}
        </small>

      </div>

      <div
        style={{
          flex: 1,
          overflowY:
            "auto",
          border:
            "1px solid #ddd",
          padding:
            "15px",
          marginBottom:
            "15px"
        }}
      >

        {messages.map(
          message => (

            <div
              key={
                message.id
              }
              style={{
                textAlign:
                  message.sender_id ===
                  user.id
                    ? "right"
                    : "left",
                marginBottom:
                  "12px"
              }}
            >
              <div
                style={{
                  display:
                    "inline-block",
                  padding:
                    "10px 15px",
                  borderRadius:
                    "10px",
                  border:
                    "1px solid #ccc"
                }}
              >
                <div>
                  {
                    message.content
                  }
                </div>

                <small>
                  {new Date(
                    message.created_at
                  ).toLocaleTimeString()}
                </small>

              </div>

            </div>

          )
        )}

        <div
          ref={
            messagesEndRef
          }
        />

      </div>

      {isTyping && (
        <small>
          {
            selectedUser.username
          } is typing...
        </small>
      )}

      <MessageInput
        onSend={
          sendMessage
        }
        onTyping={
          sendTypingEvent
        }
      />

    </div>
  );
}

export default ChatWindow;