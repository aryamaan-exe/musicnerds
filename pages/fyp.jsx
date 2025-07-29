import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useState } from "react";

export default function Fyp() {
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    async function getFeed(username, page) {
        try {
            const response = await axios.get("/api/fyp", {
                headers: {
                    'Cache-Control': 'no-cache'
                },

                params: {
                    username: username,
                    page: page,
                    _t: Date.now()
                }
            });


            return response.data;
        } catch (err) {
            if (err.response) {
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }

    const loadFeed = async (username, page) => {
        if (loading || !hasMore) return;

        setLoading(true);
        const newItems = (await getFeed(username, page)).posts;
        if (!newItems || newItems.length === 0) {
            setHasMore(false);
            return;
        }

        try {
            const updatedFeed = [...feed, ...newItems];

            setFeed(updatedFeed);
            const newLikeCounts = updatedFeed.map((post) => {
                return parseInt(post.likes, 10);
            });
            setLikeCounts(newLikeCounts);
        } catch (err) {
            console.log(err);
        }
        
        setLoading(false);
        setPage(page + 1);
    };

    const lastCardRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                await loadFeed(router.query.username, page);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return (
        <>
            <Navbar />
            
            {(loading && hasMore) && <Spinner size="lg" className="m-8" color="secondary" />}

            <Footer />
        </>
    );
}