import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    Avatar,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Image,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Snippet,
    Spinner,
} from "@heroui/react";

dayjs.extend(relativeTime);

export default function Feed({ username, authToken, initialFeed, initialLiked, fyp }) {
    const [feed, setFeed] = useState(initialFeed || []);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(2);
    const [liked, setLiked] = useState(initialLiked || []);
    const [likeCounts, setLikeCounts] = useState(
        initialFeed?.map((post) => parseInt(post.likes, 10)) || []
    );
    const observer = useRef();

    const loadFeed = useCallback(
        async (username, page) => {
            if (loading || !hasMore) return;

            setLoading(true);
            try {
                let response;
                if (fyp) {
                    response = await axios.get("/api/fyp", {
                        headers: { "Cache-Control": "no-cache" },
                        params: { username, page, _t: Date.now() },
                    });
                } else {
                    response = await axios.get("/api/feed", {
                        headers: { "Cache-Control": "no-cache" },
                        params: { username, page, _t: Date.now() },
                    });
                }
                
                const newItems = response.data?.posts || [];
                
                if (newItems.length === 0) {
                    setHasMore(false);
                    return;
                }

                setFeed((prev) => [...prev, ...newItems]);
                setLikeCounts((prev) => [
                    ...prev,
                    ...newItems.map((post) => parseInt(post.likes, 10)),
                ]);
                setPage((prev) => prev + 1);
            } catch (err) {
                console.error("Error loading more feed:", err);
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore]
    );

    async function likePost(currentUsername, postID, remove) {
    try {
        await axios.post("/api/like", {
            username: currentUsername,
            authToken,
            postID,
            remove,
        });

        setLiked((prev) =>
        remove ? prev.filter((id) => id !== postID) : [...prev, postID]
        );

        setLikeCounts((prev) =>
        prev.map((count, i) =>
            feed[i].postid === postID ? count + (remove ? -1 : 1) : count
        )
        );
    } catch (err) {
        console.error(err);
    }
    }

    const lastCardRef = useCallback(
    (node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
        async (entries) => {
            if (entries[0].isIntersecting && hasMore) {
            await loadFeed(username, page);
            }
        },
        { threshold: 0.1 }
        );

        if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, loadFeed, username]
    );

    const HeartIcon = ({ fillColor, strokeColor }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={fillColor}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={strokeColor}
        className="size-6"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
    </svg>
    );

    const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
        />
    </svg>
    );

    const ReportIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
        />
    </svg>
    );

    return (
    <div className="flex flex-col items-center">
        <div className="flex flex-col items-center w-full">
        {feed.map((post, index) => {
            const isLast = index === feed.length - 1;
            const isLiked = liked.includes(post.postid);

            return (
            <Card key={post.postid} className="m-4 w-[60vw]" ref={isLast ? lastCardRef : null}>
                <div className="md:flex p-4">
                    {post.image && <Image isZoomed src={post.image} width={150} height={150} />}
                <div className="ml-4">
                    <CardHeader className="flex flex-col items-start">
                        {
                            fyp && <div className="flex items-center mb-4">
                                <Avatar
                                    showFallback
                                    size="lg"
                                    className="mr-4"
                                    src={post.pfp}
                                   />
                                <p className="font-semibold text-lg">{post.username}</p>
                            </div>
                        }
                        <h3 className="text-xl font-bold">{post.title}</h3>
                    </CardHeader>
                    <CardBody>
                        {post.body}
                        <p className="text-gray-400 mt-8">
                            {dayjs(post.timestamp).fromNow()}
                        </p>
                    </CardBody>
                    <CardFooter className="gap-2">
                    <Button
                        isIconOnly
                        variant="flat"
                        radius="full"
                        onPress={async () => {
                            if (!authToken) return;
                            await likePost(
                                localStorage.getItem("username"),
                                post.postid,
                                isLiked
                            );
                        }}
                    >
                        <HeartIcon
                        strokeColor={isLiked ? "#f31260" : "white"}
                        fillColor={isLiked ? "#f31260" : "none"}
                        />
                    </Button>
                    <p>{likeCounts[index]}</p>
                    <Popover placement="up">
                        <PopoverTrigger>
                        <Button isIconOnly variant="flat" radius="full">
                            <ShareIcon />
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                        <Snippet className="bg-dark" symbol="" size="sm">
                            {`https://musicnerds.vercel.app/posts/${post.url}`}
                        </Snippet>
                        </PopoverContent>
                    </Popover>
                    <Button isIconOnly variant="flat" radius="full">
                        <ReportIcon />
                    </Button>
                    </CardFooter>
                </div>
                </div>
            </Card>
            );
        })}
        {loading && hasMore && (
            <Spinner size="lg" className="m-8" color="secondary" />
        )}
        </div>
    </div>
    );
}