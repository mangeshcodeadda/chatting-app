import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../api/supabase";

import { useAuth }
from "../context/AuthContext";

function NewChat({
  onSelectUser
}) {

  const { user } =
    useAuth();

  const [users,
    setUsers] =
    useState([]);

  useEffect(() => {

    loadUsers();

  }, []);

  const loadUsers =
    async () => {

      const { data } =
        await supabase
          .from("profiles")
          .select("*");

      setUsers(
        data.filter(
          u =>
            u.id !==
            user.id
        )
      );
    };

  return (
    <div>

      <h3>
        Start New Chat
      </h3>

      {users.map(u => (

        <div
          key={u.id}
          className="user-card"
          onClick={() =>
            onSelectUser(u)
          }
        >
          {u.username}
        </div>

      ))}

    </div>
  );
}

export default NewChat;