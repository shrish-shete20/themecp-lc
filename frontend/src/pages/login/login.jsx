import { useState } from "react"
import { useAuth } from "../../auth.jsx"
import "./login.css"

export default function Login() {
    const { user, logout, isAuthenticated, signIn, signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mode, setMode] = useState("sign-in");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        if (!email || !password) {
            setMessage("Email and password are required.");
            return;
        }

        setIsSubmitting(true);

        try {
            if (mode === "sign-up") {
                await signUp({
                    email,
                    password,
                    name: email.split("@")[0],
                });
            } else {
                await signIn({ email, password });
            }

            setMessage(
                mode === "sign-up"
                    ? "Account created. You are signed in."
                    : "Signed in successfully."
            );
        } catch (err) {
            setMessage(err.message || "Unable to authenticate.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-hero">
                <div className="login-badge">Free rated LeetCode practice</div>
                <h1>Train with a cleaner signal than random problem picking.</h1>
                <p>
                    Connect your account, add your LeetCode handle, and get structured
                    120-minute sets powered by external problem ratings.
                </p>

                <div className="login-highlights">
                    <span>Backend auth</span>
                    <span>ZeroTrac-style ratings</span>
                    <span>No paid services</span>
                </div>
            </section>

            <section className="auth-card">
                {isAuthenticated ? (
                    <div className="signed-in-state">
                        <p className="auth-eyebrow">You are signed in</p>
                        <h2>Welcome back, {user.name}</h2>
                        <p>Head to your profile to review stats or start a new practice contest.</p>
                        <button onClick={async () => {
                            try {
                                await logout({
                                    logoutParams: {
                                        returnTo: window.location.origin,
                                    },
                                });
                            }
                            catch {
                                alert("Unable to logout")
                            }
                        }}>Log out</button>
                    </div>
                ) : (
                    <>
                        <div className="auth-card-heading">
                            <p className="auth-eyebrow">{mode === "sign-up" ? "Create workspace" : "Welcome back"}</p>
                            <h2>{mode === "sign-up" ? "Create your account" : "Log in to continue"}</h2>
                            <p>
                                {mode === "sign-up"
                                    ? "Use an email and password to start tracking your practice progress."
                                    : "Use your ThemeCP-LeetCode account to continue your practice plan."}
                            </p>
                        </div>

                        <div className="auth-tabs" aria-label="Authentication mode">
                            <button
                                type="button"
                                className={mode === "sign-in" ? "active" : ""}
                                onClick={() => {
                                    setMessage("");
                                    setMode("sign-in");
                                }}
                            >
                                Sign in
                            </button>
                            <button
                                type="button"
                                className={mode === "sign-up" ? "active" : ""}
                                onClick={() => {
                                    setMessage("");
                                    setMode("sign-up");
                                }}
                            >
                                Sign up
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <label>
                                Email
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    autoComplete="email"
                                />
                            </label>

                            <label>
                                Password
                                <input
                                    type="password"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                                />
                            </label>

                            {message ? <p className="auth-message">{message}</p> : null}

                            <button type="submit" disabled={isSubmitting} className="primary-auth-button">
                                {isSubmitting ? "Please wait..." : mode === "sign-up" ? "Create account" : "Log in"}
                            </button>
                        </form>
                    </>
                )}
            </section>
        </main>
    )
}