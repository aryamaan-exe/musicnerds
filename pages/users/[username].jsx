import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useRouter } from 'next/router';
import { Listbox, ListboxItem, Spinner, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, Link, Image, Avatar, Button, Card, CardHeader, CardBody, CardFooter, Skeleton, Textarea, useDisclosure, Input } from "@heroui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import imageCompression from "browser-image-compression"

export function Add() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="md:size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
}

export function Edit() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="gray" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>

}

export function Close() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
}

export function HeartIcon({ fillColor, strokeColor }) {
    return <svg xmlns="http://www.w3.org/2000/svg" fill={fillColor} viewBox="0 0 24 24" strokeWidth={1.5} stroke={strokeColor} className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
}

export function ShareIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
}

export function ReportIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
}

export const ListboxWrapper = ({children}) => (
    <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
    </div>
);

export default function Profile() {

    async function checkUser(username, authToken) {
        try {
            const response = await axios.get("/user", {
                params: { username, authToken }
            });
            const response2 = await axios.get("/likes", {
                params: { username }
            });

            return {...response.data, ...response2.data};
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
    axios.defaults.timeout = 10000;
    dayjs.extend(relativeTime);

    const router = useRouter();
    const username = router.query.username;
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pfpLoading, setPfpLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [notFound, set404] = useState(false);
    const [bio, setBio] = useState("");
    const [pfp, setPfp] = useState("https://images.unsplash.com/broken");
    const [me, setMe] = useState(false);
    const [liked, setLiked] = useState([]);
    const [editing, setEditing] = useState(false);
    const [authToken, setAuthToken] = useState("");
    const [newBio, setNewBio] = useState("");
    const [newPfp, setNewPfp] = useState(null);
    const [first, setFirst] = useState("");
    const [second, setSecond] = useState("");
    const [third, setThird] = useState("");
    const [fourth, setFourth] = useState("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [x1, setX1] = useState(false);
    const [x2, setX2] = useState(false);
    const [x3, setX3] = useState(false);
    const [x4, setX4] = useState(false);
    const [hidden, setHidden] = useState(true);
    const observer = useRef();

    const lastCardRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(async (entries) => {
            if (entries[0].isIntersecting) {
                await loadFeed(router.query.username, page);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    async function getFeed(username, page) {
        try {
            const response = await axios.get("/feed", {
                params: {
                    username: username,
                    page: page
                }
            });

            return response.data;
        } catch (err) {
            if (err.response) {
                return { success: false, status: err.response.status, error: err.response.data.error };
            } else {
                return { success: false, error: err.message };
            }
        }
    }

    const loadFeed = async (username, page) => {
        if (loading || !hasMore) return;

        setLoading(true);
        const newItems = (await getFeed(username, page)).feed;
        if (!newItems || newItems.length === 0) {
            setHasMore(false);
            return;
        }

        try {
            const updatedFeed = [...feed, ...newItems];
            setFeed(updatedFeed);
        } catch (err) {
            console.log(err);
        }
        
        setLoading(false);
        setPage(page + 1);
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
                authToken: authToken,
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

    async function likePost(postID, remove) {
        try {
            const response = await axios.post("/like", {
                username, authToken, postID, remove
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
    
    useEffect(() => {
        async function x() {
            if (!router.query.username) return;
            if (window.localStorage.getItem("authToken") == "") return;
            setAuthToken(window.localStorage.getItem("authToken"));
            const req = await checkUser(username, window.localStorage.getItem("authToken"));
            if (!req) {
                set404(true);
            } else {
                setBio(req.bio);
                setPfp(req.pfp);
                setMe(req.me);
                setLiked(req.likes || []);
            }
            const mtRush = (await getMtRush(username)).data.mtRush;
            setFirst(mtRush[0]);
            setSecond(mtRush[1]);
            setThird(mtRush[2]);
            setFourth(mtRush[3]);
            await loadFeed(router.query.username, 1);
        }
        x();
    }, [router.query.username]);

    return <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow">

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
                            {me && <Link onPress={onOpen}>
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
                                src={pfp} key={pfp}
                                />
                            </Link>}
                            {!me && <Avatar
                                showFallback
                                className="md:w-20 md:h-20 w-14 h-14 text-large mr-4"
                                src={pfp} key={pfp}
                                />}
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
                            {first == "" ? <Button className="w-full h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
                                router.push("/mountrushmore?spot=1")
                            }}>
                                <p className="text-4xl">+</p>
                            </Button> :
                            <div onPointerEnter={() => {setX1(true)}} onPointerLeave={() => {setX1(false)}} className="relative z-0">
                                <Button className={x1 ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                                    removeMtRush(username, 1);
                                    setFirst("");
                                }}>
                                    <Close />
                                </Button>
                                <Image isZoomed 
                                src={first}
                                width={150} 
                                height={150} 
                                className="w-full h-auto object-cover z-5"
                                />
                            </div>}
                        </div>
                        <div className="w-full">
                            {second == "" ? <Button className="w-[95%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
                                router.push("/mountrushmore?spot=2")
                            }}><p className="text-4xl">+</p></Button>
                            : <div onPointerEnter={() => {setX2(true)}} onPointerLeave={() => {setX2(false)}} className="relative z-0">
                                <Button className={x2 ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                                    removeMtRush(username, 2);
                                    setSecond("");
                                }}>
                                    <Close />
                                </Button>
                                <Image isZoomed 
                                src={second} 
                                width={150} 
                                height={150} 
                                className="w-full h-auto object-cover z-5"
                                />
                            </div>}
                        </div>
                        <div className="w-full">
                            {third == "" ? <Button className="w-full h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
                                router.push("/mountrushmore?spot=3")
                            }}><p className="text-4xl">+</p></Button> 
                            : <div onPointerEnter={() => {setX3(true)}} onPointerLeave={() => {setX3(false)}} className="relative z-0">
                                <Button className={x3 ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                                    removeMtRush(username, 3);
                                    setThird("");
                                }}>
                                    <Close />
                                </Button>
                                <Image isZoomed 
                                    src={third} 
                                    width={150} 
                                    height={150} 
                                    className="w-full h-auto object-cover z-5"
                                    />
                            </div>}
                        </div>
                        <div className="w-full">
                            {fourth == "" ? <Button className="w-[94%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
                                router.push("/mountrushmore?spot=4")
                            }}><p className="text-4xl">+</p></Button> 
                            : <div onPointerEnter={() => {setX4(true)}} onPointerLeave={() => {setX4(false)}} className="relative z-0">
                                <Button className={x4 ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                                    removeMtRush(username, 4);
                                    setFourth("");
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

                    {me && <Button color="secondary" className="mb-2" onPress={() => {
                        setHidden(!hidden);
                    }}><Add />New Post</Button>}
                    
                    {!hidden && <ListboxWrapper>
                    <Listbox onAction={(key) => {
                        setHidden(!hidden);
                        router.push(`/${key}`)
                    }}>
                        <ListboxItem key="new">New post</ListboxItem>
                        <ListboxItem key="rec">New recommendation</ListboxItem>
                        <ListboxItem key="track">New album listened</ListboxItem>
                    </Listbox>
                    </ListboxWrapper>}

                    <div className="flex flex-col items-center">
                        {feed.map((post, index) => {
                            const isLast = index === feed.length - 1;

                            return (
                            <Card key={post.postid} className="m-4 min-w-full" ref={isLast ? lastCardRef : null}>
                                <div className="md:flex p-4">
                                    {post.image && <Image isZoomed src={post.image} width={150} height={150} />}
                                    <div className="ml-4">
                                        <CardHeader>
                                            <h3 className="text-lg font-semibold">{post.title}</h3>
                                        </CardHeader>
                                        <CardBody>
                                            {post.body}
                                            <p className="text-gray-400 mt-8">{dayjs(post.timestamp).fromNow()}</p>
                                        </CardBody>
                                        <CardFooter className="gap-2">
                                            <Button isIconOnly variant="flat" radius="full" onPress={async () => {
                                                const remove = liked.includes(post.postid);
                                                await likePost(post.postid, remove);
                                                setLiked(prev =>
                                                        remove
                                                        ? prev.filter(id => id !== post.postid)
                                                        : [...prev, post.postid]               
                                                );
                                            }}><HeartIcon strokeColor={liked.includes(post.postid) ? "#f31260" : "white"} fillColor={liked.includes(post.postid) ? "#f31260" : "none"} /></Button>
                                            <Button isIconOnly variant="flat" radius="full"><ShareIcon /></Button>
                                            <Button isIconOnly variant="flat" radius="full"><ReportIcon /></Button>
                                        </CardFooter>
                                    </div>
                                </div>
                            </Card>
                            );
                        })}

                        {(loading && hasMore) && <Spinner size="lg" className="m-8" color="secondary" />}
                        </div>

                </div>
            </div>
            
            }

        </main>

        <Footer />
  </div>;
}