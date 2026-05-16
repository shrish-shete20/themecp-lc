const { createClient } = require("@supabase/supabase-js");

let supabase;

function getSupabaseClient() {
  if (supabase) return supabase;

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    `https://${process.env.SUPABASE_PROJECT_REF || "lszwlirvgvqbadropysm"}.supabase.co`;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error("SUPABASE_ANON_KEY is required for authenticated API routes");
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

async function requireSupabaseAuth(req, res, next) {
  const token = getBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const { data, error } = await getSupabaseClient().auth.getUser(token);

    if (error || !data.user?.email) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    const metadata = data.user.user_metadata || {};
    req.authUser = {
      id: data.user.id,
      email: data.user.email,
      name: metadata.full_name || metadata.name || data.user.email.split("@")[0],
    };

    return next();
  } catch (err) {
    console.error("Supabase auth verification failed:", err);
    return res.status(500).json({ message: "Authentication service unavailable" });
  }
}

module.exports = { requireSupabaseAuth };
