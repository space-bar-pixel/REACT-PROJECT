import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../App.css";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    // --- Basic client-side validation ---
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{2,}$/;

    if (!username || !email || !password || !confirmPassword) {
      alert("Please fill all fields!");
      return;
    }

    if (!regex.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (!passwordRegex.test(password)) {
      alert(
        "Password must contain at least one uppercase letter and one number."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // --- Prepare request body ---
    const signUpData = { username, email, password };

    try {
      const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(signUpData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully!");
        navigate("/"); // Redirect to Sign-In page
      } else {
        setError(data.error || "Sign up failed!");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("A network error occurred. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <form onSubmit={handleSignUp} className="flex flex-col gap-3">
        {error && <p className="text-red-500 text-center">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create Account
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}