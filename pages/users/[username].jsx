import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useRouter } from 'next/router';
import { Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, Link, Image, Avatar, Button, Card, CardHeader, CardBody, CardFooter, Skeleton, Textarea, useDisclosure, Input } from "@heroui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression"

export function Add() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
}

export function Edit() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="gray" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
}

export function Close() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

}

export default function Profile() {

    async function checkUser(username, authToken) {
        try {
            const response = await axios.get("/user", {
                params: { username, authToken }
            });
            return response;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
    axios.defaults.timeout = 10000;

    const router = useRouter();
    const username = router.query.username;
    const [feed, setFeed] = useState([{title: "Just finished listening to Madvillainy", body: "This was my 1000th listen!", id: 1, image: "https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png", isLoaded: true}]);
    const [loading, setLoading] = useState(false);
    const [pfpLoading, setPfpLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [notFound, set404] = useState(false);
    const [bio, setBio] = useState("");
    const [pfp, setPfp] = useState("https://images.unsplash.com/broken");
    const [me, setMe] = useState(false);
    const [editing, setEditing] = useState(false);
    const [authToken, setAuthToken] = useState("");
    const [newBio, setNewBio] = useState("");
    const [newPfp, setNewPfp] = useState(null);
    const [first, setFirst] = useState("");
    const [second, setSecond] = useState("");
    const [third, setThird] = useState("");
    const [fourth, setFourth] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { mtIsOpen, mtOnOpen, mtOnOpenChange } = useDisclosure();
    const [x4, setX4] = useState(false);
    const observer = useRef();

    const lastCardRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMoreItems();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const loadMoreItems = () => {
        if (loading || !hasMore) return;

        setLoading(true);
        const newItems = Array.from({ length: 2 }, (_, i) => ({title: "Just finished listening to Madvillainy", body: "This was my 1000th listen!", id: i, image: "https://upload.wikimedia.org/wikipedia/en/5/5e/Madvillainy_cover.png", isLoaded: false}));
        const updatedFeed = [...feed, ...newItems];
        setFeed(updatedFeed);

        setTimeout(() => {
            setFeed(updatedFeed.map((post) => {
                return !post.isLoaded ? {...post, isLoaded: true} : post;
            }));

            if (page === 5) {
                setHasMore(false);
            }
            
            setPage(page + 1);
            setLoading(false);
        }, 1000);
    };

    async function changeBio(username, authToken, bio) {
        try {
            const response = axios.post("/changeBio", {
                username: username,
                authToken: authToken,
                bio: bio
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

    async function changePfp(username, authToken, pfp) {
        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true
            }
            const resizedPfp = await imageCompression(pfp, options)
            const reader = new FileReader()
            const resizedPfpB64 = await new Promise(r=>{reader.onload=()=>r(reader.result.split(",")[1]);reader.readAsDataURL(resizedPfp)})

            const response = axios.post("/changePfp", {
                username: username,
                authToken: authToken,
                pfp: resizedPfpB64
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

    async function getMtRush(username) {
        try {
            const response = axios.get("/mtRush", {
                params: {
                    username: username,
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

    async function removeMtRush(username, i) {
        try {
            const response = axios.post("/removeMtRush", {
                username: username,
                i: i
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

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.body.offsetHeight
            ) {
                loadMoreItems();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);
    
    useEffect(() => {
        async function x() {
            if (!username) return;
            setAuthToken(window.localStorage.getItem("authToken"));
            const req = await checkUser(username, window.localStorage.getItem("authToken"));
            if (!req) {
                set404(true);
            } else {
                setBio(req.data.bio);
                setPfp(req.data.pfp);
                setMe(req.data.me);
            }
            const mtRush = (await getMtRush(username)).data.mtRush;
            setFirst(mtRush[0]);
            setSecond(mtRush[1]);
            setThird(mtRush[2]);
            setFourth(mtRush[3]);
        }
        x();
    }, [router.query.username]);

    return <>
        <Navbar />

        {notFound ? 
            <div className="flex lg:ml-64 ml-8 items-center h-[85vh]">
                <div>
                    <h1>User not found</h1>
                    <p>Oops! We couldn't find a user with that username.</p>
                </div>
            </div>
        : <div>

            <div className="flex justify-center items-center my-8 mx-4">
                <Card>

                    <CardHeader>
                        <Link onPress={onOpen}>
                            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                                <ModalContent>
                                    {(onClose) => (
                                        <>
                                            <ModalHeader className="flex flex-col gap-1">Upload Avatar</ModalHeader>
                                            <ModalBody>
                                                <Input type="file" accept="image/*" onChange={async (e) => {
                                                    const newPfp = e.target.files?.[0]
                                                    if (!newPfp) return
                                                    setNewPfp(newPfp);
                                                }}></Input>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="danger" variant="light" onPress={onClose}>
                                                Close
                                                    </Button>
                                                <Button isLoading={pfpLoading} color="secondary" onPress={async () => {
                                                    setPfpLoading(true);
                                                    const result = await changePfp(username, authToken, newPfp);
                                                    if (result.status == 200) {
                                                        setPfp(result.data.pfp);
                                                    } else {
                                                        console.log(result.error);
                                                    }
                                                    setPfpLoading(false);
                                                    onClose()
                                                }}>
                                                Upload
                                                </Button>
                                            </ModalFooter>
                                        </>
                                    )}
                                </ModalContent>
                            </Modal>
                            <Avatar
                            showFallback
                            className="md:w-20 md:h-20 w-14 h-14 text-large mr-4"
                            src={pfp}
                            />
                        </Link>
                        <div>
                            <p className="text-xl font-bold">{username}</p>
                            <p>1000 albums listened</p>
                        </div>
                        <Button color="secondary" className="ml-16"><Add />Follow</Button>
                    </CardHeader>

                    <CardBody>
                        <div className="flex justify-between">
                            {editing ? <Textarea className="mr-2" defaultValue={bio} onChange={(e) => {
                                setNewBio(e.target.value);
                            }}></Textarea> : <p className="flex justify-center">{bio}</p>}
                            {me && <Link onPress={() => {
                                setEditing(true);
                            }}><Edit /></Link>}
                        </div>
                    </CardBody>

                    <CardFooter>
                        {editing && <Button color="secondary" onPress={async () => {
                            setEditing(false);
                            const result = await changeBio(username, authToken, newBio);
                            if (result.status == 200) {
                                setBio(result.data.bio);
                            }
                        }}>Save</Button>}
                    </CardFooter>
                    
                </Card>
            </div>

            <div className="flex flex-col items-center justify-center">
                <h2>Mount Rushmore</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 overflow-hidden mb-8 lg:w-[610px] md:w-[310px] w-[160px] lg:h-[150px] md:h-[300px] h-[600px]">
                    <div className="w-full">
                        {first == "" ? <Button className="w-full h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={mtOnOpen}>
                            <p className="text-4xl">+</p>
                        </Button> : <Image isZoomed 
                        src={first} 
                        width={150} 
                        height={150} 
                        className="w-full h-auto object-cover"
                        />}
                    </div>
                    <div className="w-full">
                        {second == "" ? <Button className="w-[95%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}}><p className="text-4xl">+</p></Button> : <Image isZoomed 
                        src={second} 
                        width={150} 
                        height={150} 
                        className="w-full h-auto object-cover"
                        />}
                    </div>
                    <div className="w-full">
                        {third == "" ? <Button className="w-full h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}}><p className="text-4xl">+</p></Button> : <Image isZoomed 
                        src={third} 
                        width={150} 
                        height={150} 
                        className="w-full h-auto object-cover"
                        />}
                    </div>
                    <div className="w-full">
                        {fourth == "" ? <Button className="w-[94%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}}><p className="text-4xl">+</p></Button> 
                        : <div onPointerEnter={() => {setX4(true)}} onPointerLeave={() => {setX4(false)}} className="relative z-0">
                            <Button className={x4 ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                                removeMtRush(username, 4)
                                setFourth("")
                            }}>
                                <Close />
                            </Button>

                            <Image isZoomed 
                            src={fourth}
                            width={150} 
                            height={150} 
                            className="w-full h-auto object-cover z-5">
                            </Image>
                        </div>}
                    </div>
                </div>

                <h2>Feed</h2>

                <div>
                    
                    {feed.map((post, index) => {
                        if (feed.length === index + 1) {
                            return (
                                <Card key={post.id} className="m-4">
                                    <Skeleton isLoaded={post.isLoaded}>
                                        <div className="md:flex p-4">
                                            <Image src={post.image} width={150} height={150}></Image>
                                                <div className="ml-4">
                                                    <CardHeader>
                                                        <h3 className="text-lg font-semibold">{post.title}</h3>
                                                    </CardHeader>
                                                    <CardBody>
                                                        {post.body}
                                                    </CardBody>
                                                </div>
                                        </div>
                                    </Skeleton>
                                    <div ref={lastCardRef}></div>
                                </Card>
                            )
                        } else {
                            return (
                                <Card key={post.id} className="m-4">
                                    <Skeleton isLoaded={post.isLoaded}>
                                        <div className="md:flex p-4">
                                            <Image isZoomed src={post.image} width={150} height={150}></Image>
                                                <div className="ml-4">
                                                    <CardHeader>
                                                        <h3 className="text-lg font-semibold">{post.title}</h3>
                                                    </CardHeader>
                                                    <CardBody>
                                                        {post.body}
                                                    </CardBody>
                                                </div>
                                        </div>
                                    </Skeleton>
                                </Card>
                            )
                        }
                    })}
                </div>
            </div>
        </div>}

        <Footer />
  </>;
}