import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";
import ConversationList from "../components/ConversationList";
import NewChat from "../components/NewChat";
import ChatWindow from "../components/ChatWindow";
import { Avatar } from "../utils/avatarUtils";

function Chat() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [mobileView, setMobileView] = useState("list");
  const [viewportHeight, setViewportHeight] = useState(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  // Handle mobile keyboard using Visual Viewport API
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      setViewportHeight(window.visualViewport.height);
      // Prevent default scroll behavior when keyboard opens
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        window.scrollTo(0, 0);
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    // Set initial height
    setViewportHeight(window.visualViewport.height);

    return () => {
      window.visualViewport.removeEventListener("resize", handleResize);
    };
  }, []);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(data);
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setShowNewChat(false);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { height: 100%; width:100%; margin: 0; padding: 0; }

        .chat-layout {
          display: flex;
          height: 100dvh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
          background: #F0EAFA;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          width: 340px;
          min-width: 340px;
          background: #fff;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #EDE9FE;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* ── CHAT AREA ── */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* ── MOBILE ── */
        @media (max-width: 640px) {
          .chat-layout {
            position: relative;
            height: ${viewportHeight ? `${viewportHeight}px` : '100dvh'};
            overflow: hidden;
          }
          .sidebar {
            position: absolute; inset: 0;
            width: 100%; min-width: 100%;
            z-index: 10; border-right: none;
            overflow: hidden;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar.hidden-mobile { transform: translateX(-100%); pointer-events: none; }
          .chat-area {
            position: absolute; inset: 0; width: 100%; z-index: 10;
            overflow: hidden;
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .chat-area.hidden-mobile { transform: translateX(100%); pointer-events: none; }
        }

        /* ── SIDEBAR HEADER ── */
        .sidebar-header {
          padding: 14px 16px;
          display: flex; align-items: center; gap: 10px;
          border-bottom: 1px solid #F3F0FF;
          background: #fff;
        }
        .header-name {
          font-size: 14px; font-weight: 700; color: #1A1A2E;
          margin: 0; line-height: 1.2;
        }
        .header-email {
          font-size: 11px; color: #A78BFA;
          margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .logout-btn {
          margin-left: auto;
          background: transparent; border: none;
          padding: 7px; cursor: pointer; color: #C4B5FD;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s; flex-shrink: 0;
        }
        .logout-btn:hover { background: #FEE2E2; color: #DC2626; }

        /* ── NEW CHAT BUTTON ── */
        .sidebar-actions { padding: 10px 14px; border-bottom: 1px solid #F3F0FF; }
        .new-chat-btn {
          width: 100%;
          background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
          color: #fff; border: none; border-radius: 10px;
          padding: 11px 0; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 2px 8px rgba(124,58,237,0.25);
        }
        .new-chat-btn:hover { opacity: 0.92; }
        .new-chat-btn:active { transform: scale(0.98); }

        .sidebar-content { flex: 1; overflow-y: auto; }
      `}</style>

      <div className="chat-layout">

        {/* SIDEBAR */}
        <div className={`sidebar${mobileView === "chat" ? " hidden-mobile" : ""}`}>
          <div className="sidebar-header">
            <Avatar name={profile?.username} size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="header-name">{profile?.username || "…"}</p>
              <p className="header-email">{profile?.email}</p>
            </div>
            <button className="logout-btn" onClick={logout} title="Log out">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>

          <div className="sidebar-actions">
            <button className="new-chat-btn" onClick={() => setShowNewChat(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New conversation
            </button>
          </div>

          <div className="sidebar-content">
            <ConversationList onOpenConversation={handleSelectUser} />
          </div>
        </div>

        {/* CHAT AREA */}
        <div className={`chat-area${mobileView === "list" ? " hidden-mobile" : ""}`}>
          <ChatWindow selectedUser={selectedUser} onBack={handleBack} />
        </div>

      </div>

      {/* NEW CHAT MODAL — portal-style overlay, always on top */}
      {showNewChat && (
        <NewChat
          onSelectUser={handleSelectUser}
          onClose={() => setShowNewChat(false)}
        />
      )}
    </>
  );
}

export default Chat;