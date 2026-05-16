import { useAuth0 } from "@auth0/auth0-react"
import { makeEntry, removeEntry } from "./utils"
import { useEffect } from "react"
import "./login.css"

export default function Login() {
    // user is js object
    const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();

    useEffect(() => {
        const run = async () => {
            if (isAuthenticated) {
                console.log("inside login and its authennticated")
                let x = await makeEntry(user);
            }
        };
        run();
    }, [isAuthenticated]);

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
                            await removeEntry(user.sub)
                        }
                        catch {
                            alert("unable to logout")
                        }
                    }}>LogOut</button>
                ) : (<button onClick={async () => {
                    try {
                        await loginWithRedirect();
                    } catch {
                        alert("unable to login");
                    }
                }}>
                    Login with redirect
                </button>)
            }
        </div>
    </>
}