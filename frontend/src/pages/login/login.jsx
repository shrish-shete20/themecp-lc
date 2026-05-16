import { useState } from "react"
import { supabase, useAuth } from "../../auth.jsx"
import "./login.css"

export default function Login() {
    const { user, logout, isAuthenticated } = useAuth();
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

        const result = mode === "sign-up"
            ? await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: email.split("@")[0],
                    },
                },
            })
            : await supabase.auth.signInWithPassword({ email, password });

        setIsSubmitting(false);

        if (result.error) {
            setMessage(result.error.message);
            return;
        }

        setMessage(
            mode === "sign-up"
                ? "Account created. Check your email if confirmation is enabled."
                : "Signed in successfully."
        );
    };

    return <>
        <div className="login-container">
            {
                isAuthenticated ? (
                    <h1>hello {user.name}</h1>
                ) : null
            }

            {
                isAuthenticated ? (
                    <button onClick={async () => {
                        try {
                            await logout({
                                logoutParams: {
                                    returnTo: window.location.origin,
                                },
                            });
                        }
                        catch {
                            alert("unable to logout")
                        }
                    }}>LogOut</button>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                        />
                        {message ? <p>{message}</p> : null}
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Please wait..." : mode === "sign-up" ? "Create account" : "Login"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMessage("");
                                setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                            }}
                        >
                            {mode === "sign-up" ? "Use existing account" : "Create new account"}
                        </button>
                    </form>
                )
            }
        </div>
    </>
}