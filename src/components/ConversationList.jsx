import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../api/supabase";

import { useAuth }
from "../context/AuthContext";

function ConversationList({
  onOpenConversation
}) {

  const { user } =
    useAuth();

  const [conversations,
    setConversations] =
    useState([]);

  useEffect(() => {

    if (user) {
      loadConversations();
    }

  }, [user]);

  useEffect(() => {

    const channel =
      supabase
        .channel(
          "conversation-list"
        )
        .on(
          "postgres_changes",
          {
            event:
              "INSERT",
            schema:
              "public",
            table:
              "messages"
          },
          () => {
            loadConversations();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, []);

  const loadConversations =
    async () => {

      const {
        data: participants
      } =
        await supabase
          .from(
            "chat_participants"
          )
          .select("*")
          .eq(
            "user_id",
            user.id
          );

      const result = [];

      for (const participant of participants || []) {

        const {
          data: others
        } =
          await supabase
            .from(
              "chat_participants"
            )
            .select(
              "user_id"
            )
            .eq(
              "chat_id",
              participant.chat_id
            )
            .neq(
              "user_id",
              user.id
            );

        if (
          !others?.length
        ) continue;

        const {
          data: profile
        } =
          await supabase
            .from(
              "profiles"
            )
            .select("*")
            .eq(
              "id",
              others[0].user_id
            )
            .single();

        const {
          data: lastMessage
        } =
          await supabase
            .from(
              "messages"
            )
            .select("*")
            .eq(
              "chat_id",
              participant.chat_id
            )
            .order(
              "created_at",
              {
                ascending:
                  false
              }
            )
            .limit(1)
            .single();

        result.push({
          profile,
          lastMessage
        });
      }

      result.sort(
        (a, b) =>
          new Date(
            b.lastMessage
              ?.created_at || 0
          ) -
          new Date(
            a.lastMessage
              ?.created_at || 0
          )
      );

      setConversations(
        result
      );
    };

  return (
    <div>

      <h3>
        Chats
      </h3>

      {conversations.map(
        (
          conversation,
          index
        ) => (

          <div
            key={index}
            className="conversation-card"
            onClick={() =>
              onOpenConversation(
                conversation.profile
              )
            }
          >

            <strong>
              {
                conversation
                  .profile
                  ?.username
              }
            </strong>

            <br />

            <small>
              {
                conversation
                  .lastMessage
                  ?.content
              }
            </small>

          </div>

        )
      )}

    </div>
  );
}

export default ConversationList;