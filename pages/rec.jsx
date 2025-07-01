import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardBody, CardFooter, Input, Button } from "@heroui/react";
import { useState } from "react";
import { SearchIcon } from "./mountrushmore";

export default function Rec() {
    // const [postContent, setPostContent] = useState("");

    return <>
        <Navbar />
        <div className="flex flex-col h-[85vh] m-8 items-center">
            <h1 className="mb-16">Recommend an album</h1>
            <Card>
                <CardBody className="h-32 w-96">
                    <Input startContent={SearchIcon()}></Input>
                </CardBody>
                <CardFooter>
                    <Button color="secondary" onPress={() => {
                    }}>Post</Button>
                </CardFooter>
            </Card>
        </div>
        <Footer />
    </>
}