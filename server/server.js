/* global process */
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise"; 
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigin = process.env.CLIENT_URL;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

let dbConnection;

(async () => {
    try {
        dbConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });
        console.log("MySQL connected");

        app.listen(process.env.PORT, () =>
            console.log(`Server running on port ${process.env.PORT}`)
        );

    } catch (err) {
        console.error("DB connection error:", err);
        process.exit(1); 
    }
})();

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await dbConnection.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );
    res.status(201).json({ message: "Account created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error or email already exists" });
  }
});

app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [results] = await dbConnection.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.json({ message: "Logged in" });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const [results] = await dbConnection.query(
      "SELECT id, username, email FROM users WHERE id = ?",
      [req.user.id]
    );

    if (results.length === 0)
      return res.status(401).json({ error: "Unauthorized" });
    
    res.json(results[0]);

  } catch (err) {
    console.error("Me route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGOUT ROUTE
app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { path: "/", sameSite: "Strict", secure: process.env.NODE_ENV === 'production' });
  res.json({ message: "Logged out" });
});