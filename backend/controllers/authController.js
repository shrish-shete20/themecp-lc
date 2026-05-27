const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");
const { signAuthToken } = require("../middleware/auth");

const PASSWORD_MIN_LENGTH = 8;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function toPublicUser(user) {
  return {
    id: user.id,
    sub: String(user.id),
    name: user.username,
    email: user.email,
  };
}

async function ensureThemeProfile(connection, userId, email) {
  const [existingProfile] = await connection.query(
    "SELECT id FROM theme_profile WHERE user_id = ?",
    [userId]
  );

  if (existingProfile.length === 0) {
    await connection.query(
      "INSERT INTO theme_profile (user_id, email) VALUES (?, ?)",
      [userId, email]
    );
  }
}

function validateCredentials(req, res) {
  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || "");

  if (!isValidEmail(email)) {
    res.status(400).json({ message: "A valid email is required" });
    return null;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    res.status(400).json({
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    });
    return null;
  }

  return { email, password };
}

async function signup(req, res) {
  const credentials = validateCredentials(req, res);
  if (!credentials) return;

  const { email, password } = credentials;
  const username = String(req.body?.name || email.split("@")[0]).trim() || email.split("@")[0];
  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.query(
      "SELECT id, email, username, password_hash FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    if (existingUsers[0]?.password_hash) {
      await connection.rollback();
      return res.status(409).json({ message: "An account already exists for this email" });
    }

    if (existingUsers.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        message: "This email already has an app profile but no local password. Contact the site owner to migrate it.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [createdUsers] = await connection.query(
      `
        INSERT INTO users (username, email, password_hash)
        VALUES (?, ?, ?)
        RETURNING id, email, username
      `,
      [username, email, passwordHash]
    );

    const user = createdUsers[0];
    await ensureThemeProfile(connection, user.id, user.email);
    const token = signAuthToken(user);
    await connection.commit();

    return res.status(201).json({
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Signup failed:", err);
    return res.status(500).json({ message: "Unable to create account" });
  } finally {
    connection.release();
  }
}

async function login(req, res) {
  const credentials = validateCredentials(req, res);
  if (!credentials) return;

  const { email, password } = credentials;
  const db = getDB();

  try {
    const [users] = await db.query(
      "SELECT id, email, username, password_hash FROM users WHERE LOWER(email) = LOWER(?)",
      [email]
    );
    const user = users[0];

    if (!user?.password_hash) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      user: toPublicUser(user),
      token: signAuthToken(user),
    });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ message: "Unable to log in" });
  }
}

function me(req, res) {
  return res.status(200).json({
    user: {
      id: req.authUser.id,
      sub: String(req.authUser.id),
      name: req.authUser.name,
      email: req.authUser.email,
    },
  });
}

module.exports = {
  signup,
  login,
  me,
};
