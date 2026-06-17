import { useEffect, useState } from "react";

import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";

import ConversationList from "../components/ConversationList";
import NewChat from "../components/NewChat";
import ChatWindow from "../components/ChatWindow";

function Chat() {

  const { user, logout } =
    useAuth();

  const [profile,
    setProfile] =
    useState(null);

  const [selectedUser,
    setSelectedUser] =
    useState(null);

  const [showNewChat,
    setShowNewChat] =
    useState(false);

  useEffect(() => {

    if (user) {
      loadProfile();
    }

  }, [user]);

  const loadProfile =
    async () => {

      const { data } =
        await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

      setProfile(data);
    };

  return (
    <div className="chat-layout">

      <div className="sidebar">

        <div className="sidebar-header">

          <div>

            <h2>
              {
                profile?.username
              }
            </h2>

            <small>
              {
                profile?.email
              }
            </small>

          </div>

          <button
            onClick={logout}
          >
            Logout
          </button>

        </div>

        <div className="sidebar-actions">

          <button
            onClick={() =>
              setShowNewChat(
                !showNewChat
              )
            }
          >
            New Chat
          </button>

        </div>

        <div className="sidebar-content">

          {showNewChat ? (

            <NewChat
              onSelectUser={
                user => {

                  setSelectedUser(
                    user
                  );

                  setShowNewChat(
                    false
                  );

                }
              }
            />

          ) : (

            <ConversationList
              onOpenConversation={
                setSelectedUser
              }
            />

          )}

        </div>

      </div>

      <div className="chat-area">

        <ChatWindow
          selectedUser={
            selectedUser
          }
        />

      </div>

    </div>
  );
}

export default Chat;