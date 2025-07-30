import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Spinner } from "@heroui/react";
import { Navbar } from "../components/navbar";
import Feed from "../components/Feed";
import { Footer } from "../components/footer";
import axios from "axios";

export default function Fyp() {
    const router = useRouter();
    const [authToken, setAuthToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [initialFeedLoading, setInitialFeedLoading] = useState(true);
    const [initialFeed, setInitialFeed] = useState([]);
    const [initialLiked, setInitialLiked] = useState([]);

    async function checkLikes(username) {
        try {
            const response = await axios.get("/api/likes", {
                params: { username }
            });

            return response.data;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async function getFeed(username, page) {
        try {
            const response = await axios.get("/api/fyp", {
                headers: { 'Cache-Control': 'no-cache' },
                params: { username, page, _t: Date.now() }
            });
            return response.data;
        } catch (err) {
            console.error("Error getting feed:", err);
            return { success: false, error: err.message };
        }
    }

    useEffect(() => {
        async function initialize() {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.push("/auth");
                return;
            }
            try {
                setAuthToken(token);
                const username = localStorage.getItem("username");
                setUsername(username);
                const feedData = await getFeed(username, 1);
                setInitialFeed(feedData.posts || []);
                console.log(feedData.posts);
                const likeData = await checkLikes(username);
                setInitialLiked(likeData.likes || []);
            } catch (err) {
                console.log(err);
                return;
            } finally {
                setInitialFeedLoading(false);
            }
        }
    
    initialize()}, [router]);

    if (!authToken) {
        return null;
    }

    return (
        <>
            <Navbar />
            
            <main className="flex-grow container mx-auto p-4 flex justify-center items-center">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold mb-4">For You</h1>
                    
                    {initialFeedLoading ? (
                        <div className="flex justify-center items-center h-64">
                        <Spinner size="lg" color="secondary" />
                        </div>
                    ) : (
                    <Feed
                        username={username}
                        authToken={authToken}
                        initialFeed={initialFeed}
                        initialLiked={initialLiked}
                        fyp
                    />)}
                </div>
            </main>
            <Footer />
        </>
    );
}