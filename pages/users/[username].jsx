import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useRouter } from 'next/router';
import { Snippet, Popover, PopoverTrigger, PopoverContent, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Spinner, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, Link, Image, Avatar, Button, Card, CardHeader, CardBody, CardFooter, Skeleton, Textarea, useDisclosure, Input } from "@heroui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { NewPostModal } from "../../components/newPostModal";
import { RecModal } from "../../components/recModal";
import { TrackModal } from "../../components/trackModal";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import imageCompression from "browser-image-compression";

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

export function MtRush({ spot, albumCovers, setAlbumCovers, router, authToken, me }) {
    async function removeMtRush(username, authToken, i) {
        try {
            const response = axios.post("/api/removeMtRush", {
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

    const [closeButtonVisible, setCloseButtonVisible] = useState(false);
    return <div className="w-full">
        {albumCovers[spot - 1] == "" ? (<Button disabled={!me} className="w-[94%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
            router.push(`/mountrushmore?spot=${spot}`)
        }}>
            <p className="text-4xl">{me ? "+" : ""}</p>
        </Button>) : (
        <div onPointerEnter={() => {setCloseButtonVisible(true)}} onPointerLeave={() => {setCloseButtonVisible(false)}} className="relative z-0">
            <>
                {me && <Button className={closeButtonVisible ? "absolute z-10 ml-[105px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                    removeMtRush(router.query.username, authToken, spot);
                    let albumCoversCopy = albumCovers.copyWithin();
                    albumCovers.splice(spot-1,1,"");
                    setAlbumCovers(albumCoversCopy);
                }}>
                    <Close />
                </Button>}
                <Image isZoomed 
                src={albumCovers[spot - 1]}
                width={150} 
                height={150} 
                className="w-full h-auto object-cover z-5"
                />
            </>
        </div>)}
    </div>
}

export default function Profile() {
    async function checkUser(username, authToken, currentUsername) {
        try {
            const response = await axios.get("/api/user", {
                params: { username, authToken, currentUsername }
            });

            return response.data;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
    async function checkLikes(username) {
        try {
            const response = await axios.get("/api/likes", {
                params: { username }
            });

            return response.data;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

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
    const [pfp, setPfp] = useState("");
    const [me, setMe] = useState(false);
    const [liked, setLiked] = useState([]);
    const [editing, setEditing] = useState(false);
    const [authToken, setAuthToken] = useState("");
    const [newBio, setNewBio] = useState("");
    const [newPfp, setNewPfp] = useState(null);
    const [following, setFollowing] = useState(false);
    const [albumCovers, setAlbumCovers] = useState([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // pfp modal
    const { isOpen: newPostModalIsOpen, onOpen: newPostModalOnOpen, onOpenChange: newPostModalOnOpenChange } = useDisclosure();
    const { isOpen: recModalIsOpen, onOpen: recModalOnOpen, onOpenChange: recModalOnOpenChange } = useDisclosure();
    const { isOpen: trackModalIsOpen, onOpen: trackModalOnOpen, onOpenChange: trackModalOnOpenChange } = useDisclosure();
    const [likeCounts, setLikeCounts] = useState([]);
    const [profileStat, setProfileStat] = useState({count: 0, name: "followers"});
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
            const response = await axios.get("/api/feed", {
                headers: {
                    'Cache-Control': 'no-cache'
                },

                params: {
                    username: username,
                    page: page,
                    _t: Date.now()
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
        const newItems = (await getFeed(username, page)).posts;
        if (!newItems || newItems.length === 0) {

            setHasMore(false);
            return;
        }

        try {
            const updatedFeed = [...feed, ...newItems];

            setFeed(updatedFeed);
            const newLikeCounts = updatedFeed.map((post) => {
                return parseInt(post.likes, 10);
            });
            setLikeCounts(newLikeCounts);
        } catch (err) {
            console.log(err);
        }
        
        setLoading(false);
        setPage(page + 1);
    };

    async function changeBio(username, authToken, bio) {
        try {
            const response = await axios.post("/api/changeBio", {
                username: username,
                authToken: authToken,
                bio: bio
            });

            return { success: true, status: response.status, data: response.data };
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

            const response = axios.post("/api/pfp", {
                username: username,
                pfp: resizedPfpB64
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

    async function getMtRush(username) {
        try {
            const response = axios.get("/api/mtRush", {
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

    async function followUser(username, userToFollow, remove) {
        try {
            const response = await axios.post("/api/follow", {
                username, authToken, userToFollow, remove
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
            const storedAuthToken = window.localStorage.getItem("authToken");
            setAuthToken(storedAuthToken);
            const req = await checkUser(router.query.username, storedAuthToken, window.localStorage.getItem("username"));
            const likeReq = await checkLikes(window.localStorage.getItem("username"));
            if (!req) {
                set404(true);
            } else {
                setBio(req.bio);
                setPfp(req.pfp);
                setMe(req.me);
                setFollowing(req.following);
                setLiked(likeReq.likes || []);
            }
            const mtRush = (await getMtRush(username)).data.mtRush;
            setAlbumCovers(mtRush);
            await loadFeed(router.query.username, 1);
        }
        x();
    }, [router.query.username]);

    useEffect(() => {
        if (router.query.newPost === "true") {
            setFeed([]);
            setPage(1);
            setHasMore(true);
            loadFeed(username, 1);
            router.replace(`/users/${username}`, undefined, { shallow: true });
        }
    }, [router.query.newPost, username]);

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
            : <>
                <div className="flex justify-center items-center my-8 mx-4">
                    <Card className="w-[55vh]">
                        <CardHeader className="flex justify-between">
                                <div className="flex flex-row">
                                    {me && 
                                    <div className="flex flex-row">
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
                                                                onClose();
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
                                    </div>
                                    }
                                    <div className="flex flex-row">
                                        <div>
                                            {!me && <Avatar
                                            showFallback
                                            className="md:w-20 md:h-20 w-14 h-14 text-large mr-4"
                                            src={`${pfp}?${Date.now()}`}
                                            />}
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">{username}</p>
                                            <p>{profileStat.count} {profileStat.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {!me &&
                                    (following ? <Button variant="bordered" color="secondary" onPress={() => {
                                        followUser(window.localStorage.getItem("username"), username, true);
                                        setFollowing(false);
                                    }}>Unfollow</Button> :

                                    <Button color="secondary" onPress={() => {
                                        followUser(window.localStorage.getItem("username"), username, false);
                                        setFollowing(true);
                                    }}><Add />Follow</Button>)}
                                </div>
                        </CardHeader>

                        <CardBody>
                            <div className="flex justify-between">
                                {editing ? <Textarea className="mr-2" defaultValue={bio} onChange={(e) => {
                                    setNewBio(e.target.value);
                                }}></Textarea> : <p className="flex justify-center">{bio}</p>}
                                {me && <Link onPress={() => {
                                    setEditing(true);
                                    setNewBio(bio);
                                }}><Edit /></Link>}
                            </div>
                        </CardBody>

                        <CardFooter>
                            {editing && <Button color="secondary" onPress={async () => {
                                if (newBio.trim() === "") {
                                    setNewBio(bio);
                                    setEditing(false);
                                    return;
                                }
                                const result = await changeBio(username, authToken, newBio);
                                if (result.status == 200) {
                                    setBio(newBio);
                                    setEditing(false);
                                 } else {
                                    console.log(result.error);
                                    setNewBio(bio);
                                }}}>Save</Button>}
                        </CardFooter>
                        
                    </Card>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <h2>Mount Rushmore</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4 overflow-hidden mb-8 lg:w-[610px] md:w-[310px] w-[160px] lg:h-[150px] md:h-[300px] h-[600px]">
                        {Array(4).fill(1).map((_, i) => {
                            return <MtRush spot={i + 1} albumCovers={albumCovers} setAlbumCovers={setAlbumCovers} router={router} authToken={authToken} me={me}></MtRush>
                        })}
                    </div>

                    <h2>Feed</h2>

                    <NewPostModal isOpen={newPostModalIsOpen} onOpenChange={newPostModalOnOpenChange}></NewPostModal>
                    <RecModal isOpen={recModalIsOpen} onOpenChange={recModalOnOpenChange}></RecModal>
                    <TrackModal isOpen={trackModalIsOpen} onOpenChange={trackModalOnOpenChange}></TrackModal>

                    {me && <Dropdown>
                        <DropdownTrigger>
                            <Button color="secondary" className="mb-2"><Add />New Post</Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                            <DropdownItem key="new" onPress={newPostModalOnOpen}>New post</DropdownItem>
                            <DropdownItem key="rec" onPress={recModalOnOpen}>New recommendation</DropdownItem>
                            <DropdownItem key="track" onPress={trackModalOnOpen}>New album listened</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>}

                    <div className="flex flex-col items-center">
                        {feed.map((post, index) => {
                            const isLast = index === feed.length - 1;

                            return (
                            <Card key={post.postid} className="m-4 w-[60vw]" ref={isLast ? lastCardRef : null}>
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
                                                if (!window.localStorage.getItem("authToken")) {
                                                    router.push("/auth");
                                                }
                                                const remove = liked.includes(post.postid);
                                                await likePost(window.localStorage.getItem("username"), post.postid, remove);
                                                setLiked(prev =>
                                                        remove
                                                        ? prev.filter(id => id !== post.postid)
                                                        : [...prev, post.postid]               
                                                );
                                                let likeCountsCopy = likeCounts.copyWithin();
                                                likeCountsCopy.splice(index, 1, likeCounts[index]+(remove ? -1 : 1));
                                                setLikeCounts(likeCountsCopy);
                                            }}>
                                                <HeartIcon strokeColor={liked.includes(post.postid) ? "#f31260" : "white"} fillColor={liked.includes(post.postid) ? "#f31260" : "none"} /> 
                                            </Button>
                                            <p>{likeCounts[index]}</p>
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
                                    </div>
                                </div>
                            </Card>
                            );
                        })}

                        {(loading && hasMore) && <Spinner size="lg" className="m-8" color="secondary" />}
                        </div>

                </div>
            </>
            }

        </main>

        <Footer />
  </div>;
}
