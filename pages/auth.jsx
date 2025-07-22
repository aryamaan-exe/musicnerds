import { useState } from "react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button, Input } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";
import { useRouter } from "next/router";
import axios from "axios";

export default function Auth() {
    axios.defaults.baseURL = "/api";

    async function authHandler(authMode, username, password, email) {
        if (authMode == "register") {
            try {
                const response = await axios.post("/register", {
                    username: username,
                    email: email,
                    password: password
                });

                return response;
            } catch (err) {
                if (err.response) {
                    return { success: false, status: err.response.status, error: err.response.data.error };
                } else {
                    return { success: false, error: err.message };
                }
            }
        } else {
            try {
                const response = await axios.post("/login", {
                    username: username,
                    password: password
                });

                return response;
            } catch (err) {
                if (err.response) {
                    return { success: false, status: err.response.status, error: err.response.data.error };
                } else {
                    return { success: false, error: err.message };
                }
            }
        }
    }

    const [authMode, setAuthMode] = useState("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    return (
        <>
            <Navbar />
            <div className="flex lg:ml-64 ml-8 items-center h-[85vh]">
                <div className="mr-32">
                    <h1 className="text-4xl mb-4">{authMode === "login" ? "Login" : "Register"}</h1>
                    {error && <p className="text-danger mb-4">{error}</p>}
                    {authMode === "register" && (
                        <Input 
                            label="Email" 
                            type="email" 
                            className="w-80 mb-2" 
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    )}
                    <Input 
                        label="Username" 
                        className="w-80 mb-2" 
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input 
                        label="Password" 
                        type="password" 
                        className="w-80 mb-8" 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button 
                        isLoading={loading} 
                        color="secondary" 
                        onPress={async () => {
                            setError("");
                            setLoading(true);
                            const result = await authHandler(
                                authMode, 
                                username, 
                                password, 
                                authMode === "register" ? email : null
                            );
                            
                            
                            if (result.status == 200) {
                                window.localStorage.setItem("username", username);
                                const authToken = result.data.authToken
                                window.localStorage.setItem("authToken", authToken);
                                router.push(`/users/${username}`)
                            } else {
                                setError(result.error || "Unknown error");
                            }
                            setLoading(false);
                        }}
                    >
                        {authMode === "login" ? "Login" : "Register"}
                    </Button>
                    <p className="mt-4 text-sm text-gray-500">
                        {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                        <button 
                            className="text-secondary" 
                            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                        >
                            {authMode === "login" ? "Register" : "Login"}
                        </button>
                    </p>
                </div>
                <div className="hidden sm:block max-w-xl text-center justify-center mr-8">
                    <h1 className={title()}>For music nerds, by music nerds.</h1>
                    <p className="mb-8"></p>
                    <p className={subtitle()}>Musicnerds lets you catalog your albums, showcase your taste and curate music for others.</p>
                </div>
            </div>
            <Footer />
        </>
    );
};