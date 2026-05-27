const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_JWT_SECRET must be set to at least 32 characters");
  }

  return secret;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.username,
    },
    getJwtSecret(),
    {
      expiresIn: process.env.AUTH_JWT_EXPIRES_IN || "7d",
      issuer: "themecp-lc",
      audience: "themecp-lc-frontend",
    }
  );
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: "themecp-lc",
      audience: "themecp-lc-frontend",
    });

    if (!payload.sub || !payload.email) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.authUser = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

module.exports = {
  requireAuth,
  signAuthToken,
};
