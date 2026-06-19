import { useState } from "react";

function MessageInput({ onSend, onTyping }) {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message);
    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = message.trim().length > 0;

  return (
    <>
      <style>{`
        .input-bar {
          padding: 10px 12px 12px;
          border-top: 1px solid #EDE9FE;
          background: #fff;
          flex-shrink: 0;
        }
        @media (max-width: 640px) {
          .input-bar { padding: 8px 10px env(safe-area-inset-bottom, 10px); }
        }
        .input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #F5F3FF;
          border-radius: 24px;
          padding: 6px 6px 6px 16px;
          border: 1.5px solid transparent;
          transition: border-color 0.15s;
        }
        .input-row.focused { border-color: #7C3AED; }
        .msg-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-size: 15px;
          color: #1A1A2E;
          font-family: inherit;
          padding: 4px 0;
          line-height: 1.4;
          resize: none;
          min-height: 26px;
          max-height: 100px;
        }
        @media (max-width: 640px) {
          .msg-input { font-size: 16px; }
        }
        .msg-input::placeholder { color: #C4B5FD; }
        .send-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s, transform 0.1s;
          -webkit-tap-highlight-color: transparent;
        }
        .send-btn:active { transform: scale(0.92); }
        .send-btn.can-send { background: #7C3AED; }
        .send-btn.can-send:hover { background: #6D28D9; }
        .send-btn.cannot-send { background: #EDE9FE; cursor: default; }
      `}</style>

      <div className="input-bar">
        <form
          onSubmit={handleSubmit}
          className={`input-row${focused ? " focused" : ""}`}
        >
          <input
            type="text"
            className="msg-input"
            placeholder="Message…"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (onTyping) onTyping();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
          />
          <button
            type="submit"
            className={`send-btn ${canSend ? "can-send" : "cannot-send"}`}
            disabled={!canSend}
            aria-label="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke={canSend ? "#fff" : "#C4B5FD"}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}

export default MessageInput;
