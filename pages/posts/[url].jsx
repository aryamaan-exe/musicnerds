import { Snippet, Card, CardHeader, CardBody, CardFooter, Avatar, Button, Popover, PopoverTrigger, PopoverContent, } from "@heroui/react";
import { HeartIcon } from "../users/[username]";
import { ShareIcon } from "../users/[username]";
import { ReportIcon } from "../users/[username]";
import { Navbar } from "@/components/navbar";
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

    async function likePost(currentUsername, postID, remove) {
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
    const [liked, setLiked] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function x() {
            if (!(router.isReady && router.query.url)) return;
            const request = await getPost(router.query.url);
            setPost(request.post);
        }
        x();
    }, [router.isReady, router.query.url]);

    return (
        <>
            <Navbar />
                <div className="flex justify-center my-4 h-[85vh]">
                    <Card className="w-[50vh]">
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
                        </CardBody>
                        
                        <CardFooter className="gap-2">
                            <Button isIconOnly variant="flat" radius="full" onPress={async () => {
                                if (!window.localStorage.getItem("authToken")) {
                                    router.push("/auth");
                                }
                                await likePost(window.localStorage.getItem("username"), post.postid, liked);
                                setLiked(prev =>
                                        liked
                                        ? prev.filter(id => id !== post.postid)
                                        : [...prev, post.postid]               
                                );
                                let likeCountsCopy = likeCounts.copyWithin();
                                likeCountsCopy.splice(index, 1, likeCounts[index]+(remove ? -1 : 1));
                                setLikeCounts(likeCountsCopy);
                            }}>
                                <HeartIcon strokeColor={liked ? "#f31260" : "white"} fillColor={liked ? "#f31260" : "none"} /> 
                            </Button>
                            <p>{post.likeCount}</p>
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
                </div>
            <Footer />
        </>
    );
}