import { Link } from "react-router-dom";
import {
  MessageCircle,
  Search,
  Smartphone,
  Lock,
  Heart,
} from "lucide-react";
import { Avatar } from "../utils/avatarUtils";
import "../Index.css";

function Home() {
  const friendNames = [
    "Mangesh",
    "Riya",
    "Rahul",
    "Vedant",
    "Kavya",
    "Rohan",
  ];

  return (
    <div className="homepage">

      {/* NAVBAR */}

      <nav className="navbar">
        <div className="brand">

          <div className="brand-logo">
            FZ
          </div>

          <div className="brand-info">
            <h3>FrindZOne</h3>
            <span>Built For Friends</span>
          </div>

        </div>

        <Link to="/login" className="nav-login">
          Login
        </Link>
      </nav>

      {/* HERO */}

      <section className="hero">

        <div className="floating-message msg1">
          Reached home? 🚶
        </div>

        <div className="floating-message msg2">
          Bro check this meme 😂
        </div>

        <div className="floating-message msg3">
          Tea tonight? ☕
        </div>

        <div className="hero-badge">
          <Heart size={16} />
          Built For Friends
        </div>

        <h1>
          Welcome to
          <span className="hero-highlight">
            {" "}FrindZOne
          </span>
        </h1>

        <p>
          Not another social network.
          Not another endless feed.
          <br />
          <br />
          Just friends, conversations,
          memories, inside jokes and
          late-night talks worth keeping.
        </p>

        <div className="hero-actions">

          <Link to="/login" className="primary-btn">
            Enter Our Space →
          </Link>

          <button className="secondary-btn">
            Learn More
          </button>

        </div>

        <div className="hero-note">
          Built for a few people. Made with a lot of love.
        </div>

      </section>

      {/* STATS */}

      <section className="stats">

        <div className="stat-card">
          <h2>Friends</h2>
          <span>The people who matter.</span>
        </div>

        <div className="stat-card">
          <h2>Memories</h2>
          <span>Saved forever.</span>
        </div>

        <div className="stat-card">
          <h2>Conversations</h2>
          <span>Without distractions.</span>
        </div>

      </section>

      {/* FRIENDS */}

      <section className="friends">

        <h2>The people who make this place special</h2>

        <p>
          Some friendships deserve their own app.
        </p>

        <div className="avatars-grid">

          {friendNames.map((name) => (
            <div key={name} className="avatar-item">
              <Avatar name={name} size={72} />
              <span>{name}</span>
            </div>
          ))}

        </div>

      </section>

      {/* WHY */}

      <section className="why">

        <h2>Why I Built This</h2>

        <p>
          This isn't a startup.
          This isn't a product.
          This isn't something I'm trying to sell.
        </p>

        <p>
          It's a hobby project built because
          friendships deserve their own space.
        </p>

        <p>
          Somewhere conversations don't disappear
          between ads, reels and endless scrolling.
        </p>

        <p className="ending">
          Just us.
        </p>

      </section>

      {/* FEATURES */}

      <section className="features">

        <div className="section-title">
          <h2>Everything you need, nothing you don't.</h2>
          <p>Built for real friendships.</p>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">
              <MessageCircle />
            </div>

            <h3>Late Night Talks</h3>

            <p>
              The kind of conversations that start
              at midnight and somehow end at sunrise.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Search />
            </div>

            <h3>Find That Message</h3>

            <p>
              Remember that meme from six months ago?
              You'll find it.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Smartphone />
            </div>

            <h3>Always Within Reach</h3>

            <p>
              Mobile or laptop.
              Continue where you left off.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Lock />
            </div>

            <h3>Just Friends Here</h3>

            <p>
              No followers.
              No likes.
              Just people you know.
            </p>
          </div>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-brand">

          <div className="brand-logo">
            FZ
          </div>

          <h3>FrindZOne</h3>

        </div>

        <p>
          Built by Mangesh.
        </p>

        <p>
          Not another social network.
          Just friends.
        </p>

      </footer>

    </div>
  );
}

export default Home;