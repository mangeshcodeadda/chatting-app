import { useState, useRef, useEffect } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../utils/avatarUtils";

/**
 * NewChat — search-first new conversation flow.
 * No users shown by default. DB is only queried when user types.
 * Exact-match on username (as specified).
 */
function NewChat({ onSelectUser, onClose }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | searching | done | error
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Auto-focus the search input when drawer opens
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("searching");

    // Debounce 350ms — only hits DB when user pauses typing
    debounceRef.current = setTimeout(async () => {
      try {
        // Exact-match search (case-insensitive via ilike with no wildcards)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", val.trim())
          .neq("id", user.id)
          .limit(10);

        if (error) throw error;
        setResults(data || []);
        setStatus("done");
      } catch {
        setStatus("error");
        setResults([]);
      }
    }, 350);
  };

  return (
    <>
      <style>{`
        .nc-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 10, 30, 0.45);
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          animation: ncFadeIn 0.18s ease;
        }
        @media (min-width: 641px) {
          .nc-overlay { align-items: center; }
        }
        @keyframes ncFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .nc-drawer {
          width: 100%;
          max-width: 440px;
          background: #fff;
          border-radius: 20px 20px 0 0;
          padding: 0;
          overflow: hidden;
          animation: ncSlideUp 0.22s cubic-bezier(0.34, 1.2, 0.64, 1);
          max-height: 85dvh;
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 641px) {
          .nc-drawer {
            border-radius: 16px;
            max-height: 520px;
          }
        }
        @keyframes ncSlideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .nc-handle {
          width: 36px; height: 4px;
          background: #E5E7EB; border-radius: 2px;
          margin: 10px auto 0;
          flex-shrink: 0;
        }
        @media (min-width: 641px) { .nc-handle { display: none; } }

        .nc-header {
          padding: 16px 20px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          border-bottom: 1px solid #F3F0FF;
        }
        .nc-title {
          font-size: 16px;
          font-weight: 700;
          color: #1A1A2E;
        }
        .nc-close {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #F5F3FF;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #7C3AED;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .nc-close:hover { background: #EDE9FE; }

        .nc-search-wrap {
          padding: 14px 20px;
          flex-shrink: 0;
        }
        .nc-search-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #F8F7FF;
          border-radius: 12px;
          padding: 10px 14px;
          border: 1.5px solid #EDE9FE;
          transition: border-color 0.15s;
        }
        .nc-search-inner:focus-within { border-color: #7C3AED; }
        .nc-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          color: #1A1A2E;
          font-family: inherit;
        }
        .nc-search-input::placeholder { color: #C4B5FD; }

        .nc-spinner {
          width: 16px; height: 16px;
          border: 2px solid #EDE9FE;
          border-top-color: #7C3AED;
          border-radius: 50%;
          animation: ncSpin 0.6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes ncSpin { to { transform: rotate(360deg); } }

        .nc-results { flex: 1; overflow-y: auto; padding: 0 0 12px; }

        .nc-empty {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 40px 24px; gap: 8px; text-align: center;
        }
        .nc-empty-icon {
          width: 48px; height: 48px;
          border-radius: 50%; background: #F5F3FF;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .nc-empty-title { font-size: 14px; font-weight: 600; color: #6D28D9; margin: 0; }
        .nc-empty-sub { font-size: 12px; color: #C4B5FD; margin: 0; line-height: 1.5; }

        .nc-prompt {
          display: flex; flex-direction: column;
          align-items: center; padding: 32px 24px; gap: 6px; text-align: center;
        }
        .nc-prompt p { font-size: 13px; color: #C4B5FD; margin: 0; }

        .nc-result-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px; cursor: pointer;
          transition: background 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .nc-result-item:hover { background: #FAF8FF; }
        .nc-result-item:active { background: #EDE9FE; }
        .nc-result-name { font-size: 14px; font-weight: 600; color: #1A1A2E; margin: 0; }
        .nc-result-email { font-size: 12px; color: #9CA3AF; margin: 2px 0 0; }
        .nc-result-arrow { color: #C4B5FD; margin-left: auto; flex-shrink: 0; }
      `}</style>

      <div className="nc-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="nc-drawer">
          <div className="nc-handle" />

          <div className="nc-header">
            <span className="nc-title">New conversation</span>
            <button className="nc-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="nc-search-wrap">
            <div className="nc-search-inner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#C4B5FD" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                className="nc-search-input"
                type="text"
                placeholder="Search by exact username…"
                value={query}
                onChange={handleQueryChange}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {status === "searching" && <div className="nc-spinner" />}
            </div>
          </div>

          <div className="nc-results">
            {status === "idle" && (
              <div className="nc-prompt">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                  stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p>Type a username to find someone</p>
                <p style={{ fontSize: "11px", color: "#DDD6FE" }}>Exact matches only</p>
              </div>
            )}

            {status === "done" && results.length === 0 && (
              <div className="nc-empty">
                <div className="nc-empty-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="#C4B5FD" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2"/>
                  </svg>
                </div>
                <p className="nc-empty-title">No results found</p>
                <p className="nc-empty-sub">No user with the username "{query}" exists.</p>
              </div>
            )}

            {status === "error" && (
              <div className="nc-empty">
                <p className="nc-empty-title" style={{ color: "#E05252" }}>Something went wrong</p>
                <p className="nc-empty-sub">Please try again.</p>
              </div>
            )}

            {status === "done" && results.map((profile) => (
              <div
                key={profile.id}
                className="nc-result-item"
                onClick={() => { onSelectUser(profile); onClose(); }}
              >
                <Avatar name={profile.username} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="nc-result-name">{profile.username}</p>
                  <p className="nc-result-email">{profile.email}</p>
                </div>
                <span className="nc-result-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default NewChat;