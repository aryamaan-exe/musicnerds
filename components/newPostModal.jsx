import { useDisclosure, Input, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, Textarea, Button } from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export function CharacterLimit({ content, limit }) {
    return <p className="text-gray-500">{content.length}/{limit}</p>
}

export function NewPostModal({ isOpen, onOpenChange }) {
    const [postContent, setPostContent] = useState("");
    const [loading, setLoading] = useState(false);
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

    return <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>New Post</ModalHeader>
                            <ModalBody>
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
                            </ModalBody>
                            <ModalFooter>
                            <Button isLoading={loading} color="secondary" onPress={async () => {
                                if (postContent.length === 0 || title.length === 0) return;
                                
                                setLoading(true);
                                const response = await newPost(title, postContent);
                                if (response) {
                                    router.reload();
                                }
                            }}>Post</Button>
                            </ModalFooter>
                        </>
                    )}
            </ModalContent>
        </Modal>
}