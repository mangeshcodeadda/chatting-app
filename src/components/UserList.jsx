import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import { useAuth } from "../context/AuthContext";

function UserList({ onSelectUser }) {

  const { user } = useAuth();

  const [users, setUsers] =
    useState([]);

  useEffect(() => {

    const fetchUsers =
      async () => {

      const { data, error } =
        await supabase
          .from("profiles")
          .select("*");

      if (error) {
        console.log(error);
        return;
      }

      setUsers(
        data.filter(
          u => u.id !== user.id
        )
      );
    };

    if (user) {
      fetchUsers();
    }

  }, [user]);

  return (
    <div>

      <h2>Users</h2>

      {users.map((u) => (

        <div
          key={u.id}
          style={{
            cursor: "pointer",
            marginBottom: "10px",
            border: "1px solid gray",
            padding: "10px"
          }}
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

export default UserList;