import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function AuthPage() {
    const navigate = useNavigate();
    const [isSignUpActive, setIsSignUpActive] = useState(false);

    const [username, setUsername] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [signUpError, setSignUpError] = useState(null);

    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");
    const [signInError, setSignInError] = useState(null);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[A-Za-z\d!@#$%^&*()]{8,}$/;
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    const handleSignUp = async (e) => {
        e.preventDefault();
        setSignUpError(null);

        if (!username || !signUpEmail || !signUpPassword || !confirmPassword)
            return alert("Please fill all fields!");
        if (!emailRegex.test(signUpEmail))
            return alert("Please enter a valid email!");
        if (!passwordRegex.test(signUpPassword))
            return alert(
                "Password must contain uppercase, lowercase, number and symbol."
            );
        if (signUpPassword !== confirmPassword)
            return alert("Passwords do not match!");

        try {
            const response = await fetch("http://localhost:4000/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email: signUpEmail,
                    password: signUpPassword,
                }),
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (response.ok) {
                alert("Account created successfully!");
                setIsSignUpActive(false);
            } else {
                setSignUpError(data.error || "Sign up failed!");
            }
        } catch (err) {
            console.error("Sign up error:", err);
            setSignUpError("Network error, please try again later.");
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setSignInError(null);

        if (!emailRegex.test(signInEmail)) return alert("Enter a valid email!");
        if (!passwordRegex.test(signInPassword))
            return alert(
                "Password must contain uppercase, lowercase, number and symbol."
            );

        try {
            const response = await fetch("http://localhost:4000/api/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: signInEmail,
                    password: signInPassword,
                }),
            });

            const text = await response.text();
            const data = text ? JSON.parse(text) : {};

            if (response.ok) {
                localStorage.setItem("isLoggedIn", "true");
                navigate("/home");
            } else {
                setSignInError(data.error || "Login failed!");
            }
        } catch (err) {
            console.error("Sign in error:", err);
            setSignInError("Network error, please check server.");
        }
    };

    return (
        <div className={`container ${isSignUpActive ? "active" : ""}`}>
            <div className="form-container sign-up">
                <form onSubmit={handleSignUp}>
                    <h1 className="head1">Create Account</h1>

                    <input
                        type="text"
                        placeholder="Username"s
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {signUpError && <p className="text-red-500">{signUpError}</p>}
                    <button type="submit">Sign Up</button>
                </form>
            </div>

            <div className="form-container sign-in">
                <form onSubmit={handleSignIn}>
                    <h1 className="head1">Sign In</h1>

                    <input
                        type="email"
                        placeholder="Email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                    />

                    {signInError && (
                        <p className="head1 text-red-500">{signInError}</p>
                    )}
                    <button type="submit">Sign In</button>
                </form>
            </div>

            <div className="toggle-container">
                <div className="toggle">
                    <div className="toggle-panel toggle-left">
                        <h1>Welcome Back!</h1>
                        <p>Enter your personal details to use all of our features</p>
                        <button onClick={() => setIsSignUpActive(false)}>Sign In</button>
                    </div>

                    <div className="toggle-panel toggle-right">
                        <h1>Hello, Friend!</h1>
                        <p>Register to use all of our site features</p>
                        <button onClick={() => setIsSignUpActive(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    );
}