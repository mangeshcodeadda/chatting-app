import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { supabase } from "../api/supabase";

function Register() {

  const navigate =
    useNavigate();

  const [username,
    setUsername] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleRegister =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        const {
          data,
          error
        } =
          await supabase.auth.signUp({
            email,
            password
          });

        if (error) {
          alert(error.message);
          return;
        }

        if (data.user) {

          const {
            error:
              profileError
          } =
            await supabase
              .from("profiles")
              .insert({
                id:
                  data.user.id,
                username,
                email
              });

          if (
            profileError
          ) {

            alert(
              profileError.message
            );

            return;
          }
        }

        alert(
          "Registration Successful"
        );

        navigate("/login");

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }
    };

  return (
    <div className="auth-page">

      <form
        className="auth-card"
        onSubmit={
          handleRegister
        }
      >

        <h1>
          Register
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
          required
        />

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
            ? "Creating..."
            : "Register"}
        </button>

        <p>

          Already have an account?

          {" "}

          <Link
            to="/login"
          >
            Login
          </Link>

        </p>

      </form>

    </div>
  );
}

export default Register;