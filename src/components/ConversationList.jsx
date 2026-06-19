import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../utils/avatarUtils";

function formatTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ConversationList({ onOpenConversation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("conversation-list")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () =>
        loadConversations()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const loadConversations = async () => {
    const { data: participants } = await supabase
      .from("chat_participants").select("*").eq("user_id", user.id);

    const result = [];
    for (const participant of participants || []) {
      const { data: others } = await supabase
        .from("chat_participants").select("user_id")
        .eq("chat_id", participant.chat_id).neq("user_id", user.id);

      if (!others?.length) continue;

      const { data: profile } = await supabase
        .from("profiles").select("*").eq("id", others[0].user_id).single();

      const { data: lastMessage } = await supabase
        .from("messages").select("*").eq("chat_id", participant.chat_id)
        .order("created_at", { ascending: false }).limit(1).single();

      result.push({ profile, lastMessage });
    }

    result.sort(
      (a, b) => new Date(b.lastMessage?.created_at || 0) - new Date(a.lastMessage?.created_at || 0)
    );
    setConversations(result);
  };

  // Exact-match search within existing conversations only
  const filtered = searchQuery.trim()
    ? conversations.filter(
        (c) => c.profile?.username?.toLowerCase() === searchQuery.trim().toLowerCase()
      )
    : conversations;

  return (
    <>
      <style>{`
        .cl-search-wrap { padding: 10px 14px; border-bottom: 1px solid #F3F0FF; }
        .cl-search-inner {
          display: flex; align-items: center; gap: 8px;
          background: #F8F7FF; border-radius: 10px;
          padding: 8px 12px; border: 1.5px solid transparent;
          transition: border-color 0.15s;
        }
        .cl-search-inner.focused { border-color: #A78BFA; }
        .cl-search-input {
          flex: 1; border: none; background: transparent; outline: none;
          font-size: 13px; color: #1A1A2E; font-family: inherit;
        }
        .cl-search-input::placeholder { color: #D8B4FE; }
        .cl-clear {
          background: none; border: none; cursor: pointer;
          padding: 0; color: #C4B5FD; display: flex; align-items: center;
        }

        .cl-section-label {
          font-size: 10px; font-weight: 700; color: #C4B5FD;
          text-transform: uppercase; letter-spacing: 0.08em;
          padding: 12px 16px 4px; text-align: justify;
        }

        .cl-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; cursor: pointer;
          transition: background 0.12s;
          border-bottom: 1px solid #FAFAFA;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }
        .cl-item:hover { background: #FAF8FF; }
        .cl-item.active { background: #F5F0FF; }

        .cl-body { flex: 1; min-width: 0; }
        .cl-name {
          font-size: 14px; font-weight: 600; color: #1A1A2E; margin: 0 0 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;text-align: justify;
        }
        .cl-preview {
          font-size: 12px; color: #9CA3AF; margin: 0;text-align: justify;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.4;
        }
        .cl-meta {
          display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;
        }
        .cl-time { font-size: 10px; color: #C4B5FD; }

        .cl-empty {
          display: flex; flex-direction: column; align-items: center;
          padding: 52px 24px; gap: 8px; text-align: center;
        }
        .cl-empty-icon {
          width: 52px; height: 52px; border-radius: 50%; background: #F5F3FF;
          display: flex; align-items: center; justify-content: center; margin-bottom: 4px;
        }
        .cl-empty-title { font-size: 14px; font-weight: 600; color: #7C3AED; margin: 0; }
        .cl-empty-sub { font-size: 12px; color: #C4B5FD; margin: 0; line-height: 1.5; max-width: 200px; }

        .cl-no-match { padding: 28px 16px; text-align: center; font-size: 12px; color: #C4B5FD; }
      `}</style>

      {/* Search bar — filters existing chats only */}
      <div className="cl-search-wrap">
        <div className={`cl-search-inner${searchFocused ? " focused" : ""}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="cl-search-input"
            type="text"
            placeholder="Search chats…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <button className="cl-clear" onClick={() => setSearchQuery("")} aria-label="Clear">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="cl-empty-title">No conversations yet</p>
          <p className="cl-empty-sub">Tap "New conversation" to start chatting with a friend</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="cl-no-match">No chat with "{searchQuery}"</p>
      ) : (
        <>
          <p className="cl-section-label">CHATS</p>
          {filtered.map((conversation, index) => (
            <div
              key={index}
              className={`cl-item${activeIndex === index ? " active" : ""}`}
              onClick={() => {
                setActiveIndex(index);
                onOpenConversation(conversation.profile);
              }}
            >
              <Avatar name={conversation.profile?.username} size={44} />
              <div className="cl-body">
                <p className="cl-name">{conversation.profile?.username}</p>
                <p className="cl-preview">
                  {conversation.lastMessage?.content || "No messages yet"}
                </p>
              </div>
              <div className="cl-meta">
                <span className="cl-time">{formatTime(conversation.lastMessage?.created_at)}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

export default ConversationList;