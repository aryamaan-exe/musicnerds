import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Input, Card, CardBody, CardFooter, Textarea, Button } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export function CharacterLimit({ content, limit }) {
    return <p className="text-gray-500">{content.length}/{limit}</p>
}

export default function New() {
    const [postContent, setPostContent] = useState("");
    const [title, setTitle] = useState("");
    const username = typeof window !== "undefined" ? localStorage.getItem("username") : "";
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : "";
    const router = useRouter();

    async function newPost(title, postContent) {
        try {
            const response = await axios.post("/api/post", {username, authToken, title, "body": postContent, "image": ""});
            return response;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    return <>
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">New Post</h1>
            <div className="w-[75%]">
            <Card>
                <CardBody>
                    <Input value={title} className="mb-2" placeholder="Title" endContent={
                        <div>
                            <CharacterLimit content={title} limit={80} />
                        </div>
                    } onChange={(e) => {
                        if (e.target.value.length <= 80) {
                            setTitle(e.target.value);
                        }
                    }}></Input>
                    <Textarea value={postContent} endContent={
                        <div className="mt-32">
                            <CharacterLimit content={postContent} limit={140} />
                        </div>
                    } minRows={10} className="w-full" onChange={(e) => {
                        if (e.target.value.length <= 140) {
                            setPostContent(e.target.value);
                        }
                    }}></Textarea>
                </CardBody>
                <CardFooter>
                    <Button color="secondary" onPress={async () => {
                        const response = await newPost(title, postContent);
                        if (response) {
                            router.push(`users/${username}?newPost=true`);
                        }
                    }}>Post</Button>
                </CardFooter>
            </Card>
            </div>
        </div>
        <Footer />
    </>
}