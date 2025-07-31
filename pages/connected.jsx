import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Connected() {
    const router = useRouter();

    async function connectLastFM(username, authToken, token) {
        try {
            const response = await axios.get("/api/connectLastFM", {
                params: {
                    username,
                    authToken,
                    token // lastfm token
                }
            });

            return response.data;
        } catch (err) {
            if (err.response) {
                console.log(err);
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }

    useEffect(() => {
        async function connect() {
            if (!router?.query.token) return;
            
            const session = await connectLastFM(
                window.localStorage.getItem("username"),
                window.localStorage.getItem("authToken"),
                router.query.token
            );
            window.localStorage.setItem("lastFMSessionKey", session?.key || "");
            window.localStorage.setItem("lastFMUsername", session?.lfmUsername || "");
            const username = window.localStorage.getItem("username");
            router.push(`/users/${username}`)
        }

        connect();
    }, [router]);

    return (
    <>
        <Navbar />

        <main className="h-[85vh] flex items-center lg:ml-64 ml-8">
            <div>
                <h1>All set!</h1>
                <p>Connected last.fm account, redirecting you to your profile...</p>
            </div>
        </main>

        <Footer />
    </>);
}