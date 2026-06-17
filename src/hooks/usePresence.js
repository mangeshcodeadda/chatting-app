import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

export function usePresence(roomName, user) {

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  useEffect(() => {

    if (!user) return;

    const channel =
      supabase.channel(roomName);

    channel
      .on(
        "presence",
        {
          event: "sync"
        },
        () => {

          const state =
            channel.presenceState();

          const users =
            Object.values(state).flat();

          setOnlineUsers(users);

        }
      )
      .subscribe(async status => {

        if (
          status ===
          "SUBSCRIBED"
        ) {

          await channel.track({
            id: user.id,
            username: user.email
          });

        }

      });

    return () => {
      supabase.removeChannel(
        channel
      );
    };

  }, [roomName, user]);

  return onlineUsers;
}