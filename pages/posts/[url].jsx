import { Image, Skeleton, Snippet, Card, CardHeader, CardBody, CardFooter, Avatar, Button, Popover, PopoverTrigger, PopoverContent, } from "@heroui/react";
import { HeartIcon, ShareIcon, ReportIcon } from "@/components/icons";
import { Navbar } from "../../components/navbar";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Post() {
    async function getPost(url) {
        try {
            const response = await axios.get("/api/getPost", {
                params: { url }
            });

            return response.data;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

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

    async function likePost(currentUsername, authToken, postID, remove) {
        try {
            const response = await axios.post("/api/like", {
                username: currentUsername, authToken, postID, remove
            });

            return response;
        } catch (err) {
            console.log(err);
            if (err.response) {
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }

    const [pfp, setPfp] = useState("");
    const [username, setUsername] = useState("ari");
    const [post, setPost] = useState({title: "Post title", body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eget risus a urna vestibulum varius ut nec lectus. Ut porttitor dolor non odio malesuada egestas. Praesent nec libero in est suscipit pretium egestas et lorem. Quisque vel tellus id massa hendrerit dapibus nec quis lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque dictum sem ligula, vel consectetur lacus vehicula vitae. Integer dolor sem, tempus et mi non, sodales pretium leo."});
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [postID, setPostID] = useState(0);
    const [postImage, setPostImage] = useState("");
    const router = useRouter();

    useEffect(() => {
        async function x() {
            if (!(router.isReady && router.query.url)) return;
            const post = (await getPost(router.query.url)).post;
            console.log(post);
            setPost(post);
            if (window.localStorage.getItem("username")) {
                const likedPosts = (await checkLikes(window.localStorage.getItem("username"))).likes;
                setLiked(likedPosts[likedPosts.indexOf(post.postid)]);
            }
            setLikeCount(parseInt(post.likes));
            setPostID(post.postid);
            setUsername(post.username);
            setPfp(post.pfp);
            setPostImage(post.image);
            setLoading(false);
        }
        x();
    }, [router.isReady, router.query.url]);

    return (
        <>
            <Navbar />
                <div className="flex justify-center my-4 h-[85vh]">
                    <Skeleton className="rounded-3xl" isLoaded={!loading}>
                        <Card className="w-[50vw]">
                            <CardHeader className="flex flex-col items-start">
                                <div className="flex flex-row items-center">
                                    <Avatar showFallback
                                            className="md:w-16 md:h-16 w-14 h-14 text-large mr-4"
                                            src={pfp}
                                            />
                                    <p className="text-xl">{username}</p>
                                </div>
                                <h3 className="text-2xl font-bold mt-4">{post.title}</h3>
                            </CardHeader>
                            <CardBody>
                                {post.body}
                                <Image className="mt-4" src={post.image}></Image>
                            </CardBody>
                            
                            <CardFooter className="gap-2">
                                <Button isIconOnly variant="flat" radius="full" onPress={async () => {
                                    if (!window.localStorage.getItem("authToken")) {
                                        router.push("/auth");
                                    }
                                    await likePost(window.localStorage.getItem("username"), window.localStorage.getItem("authToken"), postID, liked);
                                    setLikeCount(likeCount + (liked ? -1 : 1));
                                    setLiked(!liked);
                                }}>
                                    <HeartIcon strokeColor={liked ? "#f31260" : "white"} fillColor={liked ? "#f31260" : "none"} /> 
                                </Button>
                                <p>{likeCount}</p>
                                <Popover placement="up">
                                <PopoverTrigger>
                                    <Button isIconOnly variant="flat" radius="full"><ShareIcon /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Snippet className="bg-dark" symbol="" size="sm">https://musicnerds.vercel.app/posts/{post.url}</Snippet>
                                </PopoverContent>
                                </Popover>
                                <Button isIconOnly variant="flat" radius="full"><ReportIcon /></Button>
                            </CardFooter>
                        </Card>
                    </Skeleton>
                </div>
            <Footer />
        </>
    );
}