import { useState, useEffect } from "react";
import { useRouter } from "next/router";


import { Navbar } from "../components/navbar";
import Feed from "../components/Feed";
import { Footer } from "../components/footer";

export default function Fyp() {
    const router = useRouter();
    const [authToken, setAuthToken] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
        } else {
            setAuthToken(token);
        }
    }, [router]);

    if (!authToken) {
        return null; 
    }

    return (
        <>
            <Navbar />
            
            <main className="flex-grow container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">For You Page</h1>
                {authToken && <Feed username="" authToken={authToken} />}
            </main>
            <Footer />
        </>
    );
}