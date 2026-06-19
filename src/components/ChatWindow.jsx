import { useEffect, useRef, useState } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";
import { usePresence } from "../hooks/usePresence";
import MessageInput from "./MessageInput";
import { markMessagesAsRead } from "../services/messageService";
import { Avatar } from "../utils/avatarUtils";

function formatTime(isoString) {
  return new Date(isoString + "Z").toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function TypingDots() {
  return (
    <span style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{
          width: "5px", height: "5px", borderRadius: "50%", background: "#A855F7",
          display: "inline-block",
          animation: `typingBounce 1s ${i * 0.15}s infinite ease-in-out`,
        }} />
      ))}
    </span>
  );
}

function ChatWindow({ selectedUser, onBack }) {
  const { user } = useAuth();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingChannelRef = useRef(null);

  const onlineUsers = usePresence("global-online", user);
  const isOnline = onlineUsers.some((u) => u.id === selectedUser?.id);

  useEffect(() => {
    if (selectedUser && user) initializeChat();
  }, [selectedUser]);

  useEffect(() => {
    if (!chatId) return;
    const messageChannel = supabase
      .channel(`messages-${chatId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => setMessages((cur) => [...cur, payload.new])
      ).subscribe();
    return () => supabase.removeChannel(messageChannel);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const typingChannel = supabase.channel(`typing-${chatId}`);
    typingChannelRef.current = typingChannel;
    typingChannel
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload.userId !== user.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 1500);
        }
      }).subscribe();
    return () => supabase.removeChannel(typingChannel);
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    const { data: myChats } = await supabase
      .from("chat_participants").select("chat_id").eq("user_id", user.id);
    const { data: otherChats } = await supabase
      .from("chat_participants").select("chat_id").eq("user_id", selectedUser.id);

    const commonChat = myChats.find((myChat) =>
      otherChats.some((other) => other.chat_id === myChat.chat_id)
    );

    let currentChatId;
    if (commonChat) {
      currentChatId = commonChat.chat_id;
    } else {
      const { data: chat } = await supabase.from("chats").insert({}).select().single();
      currentChatId = chat.id;
      await supabase.from("chat_participants").insert([
        { chat_id: currentChatId, user_id: user.id },
        { chat_id: currentChatId, user_id: selectedUser.id },
      ]);
    }

    setChatId(currentChatId);
    await loadMessages(currentChatId);
    await markMessagesAsRead(currentChatId, user.id);
  };

  const loadMessages = async (id) => {
    const { data } = await supabase
      .from("messages").select("*").eq("chat_id", id).order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async (content) => {
    await supabase.from("messages").insert({ chat_id: chatId, sender_id: user.id, content });
  };

  const sendTypingEvent = async () => {
    if (!typingChannelRef.current) return;
    typingChannelRef.current.send({
      type: "broadcast", event: "typing", payload: { userId: user.id }
    });
  };

  if (!selectedUser) {
    return (
      <>
        <style>{`
          .cw-empty {
            flex: 1; display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: 100%; gap: 10px; user-select: none;
            background: #FDFBFF;
          }
          .cw-empty-ring {
            width: 72px; height: 72px; border-radius: 50%;
            background: linear-gradient(135deg, #EDE9FE 0%, #FCE7F3 100%);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 4px;
          }
          .cw-empty-title { font-size: 17px; font-weight: 700; color: #5B21B6; margin: 0; font-family: 'Inter', sans-serif; }
          .cw-empty-sub { font-size: 13px; color: #C4B5FD; margin: 0; text-align: center; max-width: 200px; line-height: 1.6; font-family: 'Inter', sans-serif; }
        `}</style>
        <div className="cw-empty">
          <div className="cw-empty-ring">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="#A78BFA" strokeWidth="1.6" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="cw-empty-title">Select a chat</p>
          <p className="cw-empty-sub">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes typingBounce {
          0%,60%,100% { transform:translateY(0); opacity:0.35; }
          30% { transform:translateY(-5px); opacity:1; }
        }
        @keyframes bubbleIn {
          from { opacity:0; transform:translateY(6px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }

        .cw-window {
          display: flex; flex-direction: column; height: 100%;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* ── HEADER ── */
        .cw-header {
          padding: 12px 16px;
          border-bottom: 1px solid #EDE9FE;
          display: flex; align-items: center; gap: 12px;
          background: #fff; flex-shrink: 0; min-height: 62px;
        }
        .cw-back {
          background: none; border: none; padding: 6px; cursor: pointer;
          color: #7C3AED; display: none; align-items: center; justify-content: center;
          border-radius: 8px; transition: background 0.12s; flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
        }
        .cw-back:hover { background: #F5F3FF; }
        @media (max-width: 640px) { .cw-back { display: flex; } }
        .cw-hname { font-size: 15px; font-weight: 700; color: #1A1A2E; margin: 0; text-align: justify; }
        .cw-status { display: flex; align-items: center; gap: 4px; }
        .cw-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        /* ── MESSAGES AREA — subtle chat wallpaper ── */
        .cw-messages {
          flex: 1; overflow-y: auto; padding: 16px 16px 8px;
          display: flex; flex-direction: column; gap: 2px;
          -webkit-overflow-scrolling: touch;

          /* Soft dot-grid wallpaper */
          background-color: #F9F7FF;
          background-image: radial-gradient(circle, #DDD6FE 1px, transparent 1px);
          background-size: 22px 22px;
        }
        @media (max-width: 640px) { .cw-messages { padding: 10px 10px 4px; } }

        /* ── DATE DIVIDER ── */
        .cw-date {
          display: flex; align-items: center; gap: 8px;
          margin: 10px 0 6px; color: #A78BFA; font-size: 11px; font-weight: 500;
        }
        .cw-date::before, .cw-date::after {
          content: ''; flex: 1; height: 1px; background: #EDE9FE;
        }
        .cw-date-pill {
          background: #fff; border: 1px solid #EDE9FE;
          border-radius: 20px; padding: 3px 12px;
          font-size: 11px; color: #A78BFA; white-space: nowrap;
        }

        /* ── BUBBLES ── */
        .cw-bubble-row { display: flex; margin-bottom: 3px; }
        .cw-sent { justify-content: flex-end; }
        .cw-received { justify-content: flex-start; }

        .cw-bubble {
          max-width: 72%; padding: 9px 13px 6px;
          border-radius: 18px; font-size: 14px; line-height: 1.5;
          word-break: break-word; position: relative;
          animation: bubbleIn 0.18s ease both;
        }
        @media (max-width: 640px) { .cw-bubble { max-width: 84%; font-size: 15px; } }

        .cw-bubble-s {
          background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
          color: #fff; border-bottom-right-radius: 4px;
        }
        .cw-bubble-r {
          background: #fff; color: #1F2937;
          border: 1px solid #EDE9FE; border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .cw-text { display: block; }
        .cw-time { display: block; font-size: 10px; margin-top: 4px; line-height: 1; }
        .cw-time-s { color: rgba(255,255,255,0.65); text-align: right; }
        .cw-time-r { color: #C4B5FD; text-align: left; }

        /* ── TYPING ── */
        .cw-typing {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; background: #fff;
          border: 1px solid #EDE9FE; border-radius: 18px; border-bottom-left-radius: 4px;
          font-size: 12px; color: #9CA3AF; font-style: italic;
          margin-top: 2px; align-self: flex-start;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }

        /* ── SAY HELLO ── */
        .cw-hello {
          text-align: center; padding: 32px 0 16px;
          color: #C4B5FD; font-size: 13px;
        }
      `}</style>

      <div className="cw-window">
        {/* Header */}
        <div className="cw-header">
          <button className="cw-back" onClick={onBack} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <Avatar name={selectedUser.username} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="cw-hname">{selectedUser.username}</p>
            <div className="cw-status">
              <span className="cw-dot" style={{ background: isOnline ? "#10B981" : "#D1D5DB" }} />
              <span style={{ fontSize: "11px", color: isOnline ? "#059669" : "#9CA3AF" }}>
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="cw-messages">
          {messages.length === 0 && (
            <div className="cw-hello">Say hello 👋</div>
          )}

          {messages.map((message, i) => {
            const isSent = message.sender_id === user.id;
            const prev = messages[i - 1];
            const showDate = !prev ||
              new Date(message.created_at).toDateString() !== new Date(prev.created_at).toDateString();

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="cw-date">
                    <span className="cw-date-pill">{formatDateLabel(message.created_at)}</span>
                  </div>
                )}
                <div className={`cw-bubble-row ${isSent ? "cw-sent" : "cw-received"}`}>
                  <div className={`cw-bubble ${isSent ? "cw-bubble-s" : "cw-bubble-r"}`}>
                    <span className="cw-text">{message.content}</span>
                    <span className={`cw-time ${isSent ? "cw-time-s" : "cw-time-r"}`}>
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="cw-typing">
              <TypingDots />
              {selectedUser.username} is typing
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSend={sendMessage} onTyping={sendTypingEvent} />
      </div>
    </>
  );
}

export default ChatWindow;