import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardBody, CardFooter, Textarea, Button } from "@heroui/react";
import { useState } from "react";

export function CharacterLimit({ content }) {
    return <p className="text-gray-500 mt-32">{content.length}/140</p>
}

export default function New() {
    const [postContent, setPostContent] = useState("");

    return <>
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">New Post</h1>
            <div className="w-[75%]">
            <Card>
                <CardBody>
                    <Textarea value={postContent} endContent={<CharacterLimit content={postContent} />} minRows={10} className="w-full" onChange={(e) => {
                        if (e.target.value.length <= 140) {
                            setPostContent(e.target.value);
                        }
                    }}></Textarea>
                </CardBody>
                <CardFooter>
                    <Button color="secondary" onPress={() => {
                        console.log(postContent);
                    }}>Post</Button>
                </CardFooter>
            </Card>
            </div>
        </div>
        <Footer />
    </>
}