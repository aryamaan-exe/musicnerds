import { Card, CardBody, CardFooter, Textarea, Button} from "@heroui/react";
import { CharacterLimit } from "./newPostModal";
import { useEffect, useState } from "react";
import axios from "axios";

export function ReplyCard({ post }) {
    async function getReplies(postID) {
        try {
            const response = axios.get("/api/replies", {
                    headers: { "Cache-Control": "no-cache" },
                    params: { username, page, _t: Date.now() },
                });
        } catch (err) {
            if (err.response) {
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }
    async function reply(username, authToken, content, postID) {
        try {
            const response = axios.post("/api/reply", {
                username,
                content,
                postID
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
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

    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false);

    return <>
        <Card key={`Reply to ${post.postid}`} className="m-4 lg:ml-24 md:ml-16 ml-12 w-[55vw]">
            <CardBody>
                <Textarea value={replyContent} endContent={
                    <div className="mt-32">
                        <CharacterLimit content={replyContent} limit={140} />
                    </div>
                } minRows={10} className="w-full" onChange={(e) => {
                    if (e.target.value.length <= 140) {
                        setReplyContent(e.target.value);
                    }
                }}></Textarea>
            </CardBody>
            <CardFooter>
            <Button isLoading={loading} color="secondary" onPress={async () => {
                if (replyContent.length === 0) return;
                setLoading(true);
                await reply(window.localStorage.getItem("username"),
                            window.localStorage.getItem("authToken"),
                            replyContent,
                            post.postid);
            }}>Reply</Button>
            </CardFooter>
        </Card>

        {/* {replies?.map((reply) => {
             return <>
                 <Card>
                     <CardHeader>{reply.</CardHeader>
                     <CardBody></CardBody>
                 </Card>
             </>
        })}*/}
    </>;
}