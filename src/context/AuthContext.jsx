import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import { supabase } from "../api/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  useEffect(() => {

    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
      });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);