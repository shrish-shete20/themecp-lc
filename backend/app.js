const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const problemRoutes = require("./routes/problemRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const contestRoutes = require("./routes/contestRoutes");

const app = express();

const defaultOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  "https://themecp-leetcode.vercel.app",
  "https://themecp-lc-frontend.vercel.app"
];

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(cors({
  origin: [...defaultOrigins, ...configuredOrigins],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

app.use("/users", userRoutes);
app.use("/problems", problemRoutes);
app.use("/leetcode", leetcodeRoutes);
app.use("/contest", contestRoutes);

module.exports = app;