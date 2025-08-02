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
import {
    HeartIcon,
    ShareIcon,
    ReportIcon,
    ReplyIcon
} from "../components/icons";
import { ReplyCard } from "./replyCard";

dayjs.extend(relativeTime);

export default function Feed({ username, authToken, initialFeed, initialLiked, fyp }) {
    const [feed, setFeed] = useState(initialFeed || []);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(2);

    const [liked, setLiked] = useState(() =>
        (initialLiked || []).reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {})
    );

    const [likeCounts, setLikeCounts] = useState(() =>
        (initialFeed || []).reduce((acc, post) => {
            acc[post.postid] = parseInt(post.likes, 10);
            return acc;
        }, {})
    );

    const [currentlyReplying, setCurrentlyReplying] = useState(() =>
        (initialFeed || []).reduce((acc, post) => {
            acc[post.postid] = false;
            return acc;
        }, {})
    );

    const observer = useRef();

    const formatter = new Intl.NumberFormat('en', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1
    });

    const loadFeed = useCallback(
        async (username, page) => {
            if (loading || !hasMore) return;
            setLoading(true);
            try {
                const response = await axios.get(fyp ? "/api/fyp" : "/api/feed", {
                    headers: { "Cache-Control": "no-cache" },
                    params: { username, page, _t: Date.now() },
                });
                const newItems = response.data?.posts || [];
                if (newItems.length === 0) {
                    setHasMore(false);
                } else {
                    setFeed(prev => [...prev, ...newItems]);
                    setLikeCounts(prev => {
                        const updated = { ...prev };
                        newItems.forEach(post => {
                            updated[post.postid] = parseInt(post.likes, 10);
                        });
                        return updated;
                    });
                    setPage(prev => prev + 1);
                }
            } catch {
            } finally {
                setLoading(false);
            }
        },
        [loading, hasMore, fyp]
    );

    async function likePost(currentUsername, postID, remove) {
        try {
            await axios.post("/api/like", {
                username: currentUsername,
                authToken,
                postID,
                remove,
            });
        } catch {}
    }

    const lastCardRef = useCallback(
        node => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                entries => {
                    if (entries[0].isIntersecting && hasMore) {
                        loadFeed(username, page);
                    }
                },
                { threshold: 0.1 }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, page, loadFeed, username]
    );

    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col items-center w-full">
                {feed.map((post, index) => {
                    const isLast = index === feed.length - 1;
                    const isLiked = Boolean(liked[post.postid]);
                    const isReplying = Boolean(currentlyReplying[post.postid]);
                    const count = likeCounts[post.postid] ?? 0;

                    return (
                        <>
                        <Card key={post.postid} className="m-4 w-[60vw]" ref={isLast ? lastCardRef : null}>
                            <div className="md:flex p-4">
                                {post.image && <Image isZoomed src={post.image} width={150} height={150} />}
                                <div className="ml-4">
                                    <CardHeader className="flex flex-col items-start">
                                        {fyp && (
                                            <div className="flex items-center mb-4">
                                                <Avatar showFallback size="lg" className="mr-4" src={post.pfp} />
                                                <p className="font-semibold text-lg">{post.username}</p>
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold">{post.title}</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {post.body}
                                        <p className="text-gray-400 mt-8">{dayjs(post.timestamp).fromNow()}</p>
                                    </CardBody>
                                    <CardFooter className="gap-2">
                                        <Button
                                            isIconOnly
                                            variant="flat"
                                            radius="full"
                                            onPress={() => {
                                                if (!authToken) return;
                                                const willLike = !isLiked;
                                                setLiked(prev => ({
                                                    ...prev,
                                                    [post.postid]: willLike,
                                                }));
                                                setLikeCounts(prev => ({
                                                    ...prev,
                                                    [post.postid]: (prev[post.postid] ?? 0) + (willLike ? 1 : -1),
                                                }));
                                                likePost(
                                                    localStorage.getItem("username"),
                                                    post.postid,
                                                    !willLike
                                                );
                                            }}
                                        >
                                            <HeartIcon
                                                strokeColor={isLiked ? "#f31260" : "white"}
                                                fillColor={isLiked ? "#f31260" : "none"}
                                            />
                                        </Button>
                                        <p>{formatter.format(count)}</p>
                                        <Button 
                                            isIconOnly
                                            variant="flat"
                                            radius="full"
                                            onPress={() => {
                                                if (!authToken) return;
                                                setCurrentlyReplying(prev => ({
                                                    ...prev,
                                                    [post.postid]: !prev[post.postid],
                                                }))
                                            }}>
                                            <ReplyIcon />
                                        </Button>
                                        <p>{formatter.format(post.replycount)}</p>

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
                        {currentlyReplying[post.postid] && <ReplyCard post={post} />}
                        </>
                    );
                })}
                {loading && hasMore && <Spinner size="lg" className="m-8" color="secondary" />}
            </div>
        </div>
    );
}
