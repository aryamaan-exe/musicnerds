import { Card, CardBody, CardFooter, Textarea, Button} from "@heroui/react";
import { CharacterLimit } from "./newPostModal";
import { useState } from "react";

export function ReplyCard({ post }) {
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
                setLoading(true);
                // await reply(replyContent);
            }}>Reply</Button>
            </CardFooter>
        </Card>
    </>;
}