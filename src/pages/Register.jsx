import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "../api/supabase";

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);

  const getStrengthClass = () => {
    if (passwordStrength <= 2) return "strength-weak";
    if (passwordStrength <= 4) return "strength-medium";
    return "strength-strong";
  };

  const getStrengthText = () => {
    if (!password) return "";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, username, email });

        if (profileError) {
          setError(profileError.message);
          return;
        }
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join your friends and start chatting</p>

        {error && (
          <div className="error-message">
            <AlertCircle />
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">
            <User />
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <Mail />
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <Lock />
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div className={`strength-fill ${getStrengthClass()}`} />
              </div>
              <span className="strength-text">{getStrengthText()}</span>
            </div>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;