import { useState } from "react";

function MessageInput({
  onSend,
  onTyping
}) {

  const [message, setMessage] =
    useState("");

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    onSend(message);

    setMessage("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "20px"
      }}
    >
      <input
        type="text"
        value={message}
        placeholder="Type a message..."
        onChange={(e) => {

          setMessage(
            e.target.value
          );

          if (onTyping) {
            onTyping();
          }

        }}
        style={{
          flex: 1,
          padding: "10px"
        }}
      />

      <button type="submit">
        Send
      </button>

    </form>
  );
}

export default MessageInput;