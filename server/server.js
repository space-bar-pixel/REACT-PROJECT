/* global process */

// ======================== BACKEND (server.js) ========================
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) console.error("DB connection error:", err);
  else console.log("✅ MySQL connected");
});

// SIGNUP ROUTE
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
      (err) => {
        if (err) {
          console.error("Signup error:", err);
          return res.status(500).json({ error: "Database error: " + err.code });
        }
        res.status(201).json({ message: "Account created successfully" });
      }
    );
  } catch (err) {
    console.error("Unexpected signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SIGNIN ROUTE
app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, result) => {
      if (err || result.length === 0)
        return res.status(401).json({ error: "Invalid credentials" });

      const user = result[0];
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.json({ message: "Logged in" });
    }
  );
});

// PROTECTED ROUTE
app.get("/api/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    db.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [decoded.id],
      (err, result) => {
        if (err || result.length === 0)
          return res.status(401).json({ error: "Unauthorized" });
        res.json(result[0]);
      }
    );
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// LOGOUT ROUTE
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out" });
});

app.listen(process.env.PORT || 4000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 4000}`)
);