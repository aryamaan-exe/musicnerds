import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardBody, CardFooter, Textarea, Button } from "@heroui/react";
import { useState } from "react";

export default function New() {
    const [postContent, setPostContent] = useState("");

    return <>
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">New Post</h1>
            <Card>
                <CardBody className="h-32 w-96">
                    <Textarea className="h-full w-full" onChange={(e) => {
                        setPostContent(e.target.value);
                    }}></Textarea>
                </CardBody>
                <CardFooter>
                    <Button color="secondary" onPress={() => {
                        console.log(postContent);
                    }}>Post</Button>
                </CardFooter>
            </Card>
        </div>
        <Footer />
    </>
}