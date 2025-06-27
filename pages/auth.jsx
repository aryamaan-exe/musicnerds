import { useState } from "react";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button, Input } from "@heroui/react";
import { title, subtitle } from "@/components/primitives";

const Auth = () => {
    const [authMode, setAuthMode] = useState("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function authHandler(authMode, username, password, email=null) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${authMode}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: email == null ? JSON.stringify({username, password}) : JSON.stringify({username, email, password}),
                credentials: "include"
            });

            const data = await res.json();
            if (res.ok) {
                return { success: true, message: data.message };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: "Connection error. Please try again." };
        }
    }

    return (
        <>
            <Navbar />
            <div className="flex lg:ml-64 ml-8 items-center h-[85vh]">
                <div className="mr-32">
                    <h1 className="text-4xl mb-4">{authMode === "login" ? "Login" : "Register"}</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
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
                            if (result.success) {
                                window.location.href = "/";
                            } else {
                                setError(result.error);
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

export default Auth;