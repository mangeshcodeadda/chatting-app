import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import { supabase } from "../api/supabase";

function Login() {

  const navigate =
    useNavigate();

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleLogin =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const { error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) {
          alert(error.message);
          return;
        }

        navigate("/chat");

      } catch (err) {

        console.error(err);
        alert(
          "Login failed"
        );

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={handleLogin}
      >

        <h1>
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          required
        />

        <button
          type="submit"
        >
          {loading
            ? "Logging In..."
            : "Login"}
        </button>

        <p>

          Don't have an account?

          {" "}

          <Link
            to="/register"
          >
            Register
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Login;