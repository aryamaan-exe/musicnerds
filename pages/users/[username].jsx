import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useRouter } from 'next/router';
import { Snippet, Popover, PopoverTrigger, PopoverContent, Dropdown, DropdownItem, DropdownTrigger, DropdownMenu, Spinner, Modal, ModalHeader, ModalBody, ModalContent, ModalFooter, Link, Image, Avatar, Button, Card, CardHeader, CardBody, CardFooter, Skeleton, Textarea, useDisclosure, Input } from "@heroui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import Feed from "../../components/Feed";
import { NewPostModal } from "../../components/newPostModal";
import { RecModal } from "../../components/recModal";
import { TrackModal } from "../../components/trackModal";
import { Add, Edit, Close, HeartIcon, ShareIcon, ReportIcon, LastFMIcon } from "../../components/icons";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import imageCompression from "browser-image-compression";

export async function getLastFMUrl(username) {
    try {
        const response = await axios.get("/api/getLastFMUrl", {
            params: {
                username
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

async function getFeed(username, page) {
    try {
        const response = await axios.get("/api/feed", {
            headers: { 'Cache-Control': 'no-cache' },
            params: { username, page, _t: Date.now() }
        });
        return response.data;
    } catch (err) {
        console.error("Error getting feed:", err);
        return { success: false, error: err.message };
    }
}

export const ListboxWrapper = ({children}) => (
    <div className="w-full max-w-[260px] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
    </div>
);

export function LastFMButton() {
    return <Button className="bg-red-600"><LastFMIcon /> Connect last.fm</Button>
}

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
    return <div className="aspect-square w-[150px]">
        {albumCovers[spot - 1] == "" ? (<Button disabled={!me} className="w-[94%] h-[95%] m-1" style={{outlineStyle: "dashed", outlineColor: "white", backgroundColor: "black"}} onPress={() => {
            router.push(`/mountrushmore?spot=${spot}`)
        }}>
            <p className="text-4xl">{me ? "+" : ""}</p>
        </Button>) : (
        <div onMouseEnter={() => {setCloseButtonVisible(true)}} onMouseLeave={() => {setCloseButtonVisible(false)}} className="relative z-0">
            <>
                {me && <Button className={closeButtonVisible ? "absolute z-50 ml-[115px] mt-1" : "hidden"} isIconOnly color="danger" variant="faded" size="sm" onPress={() => {
                    let albumCoversCopy = [...albumCovers];
                    albumCoversCopy[spot - 1] = "";
                    setAlbumCovers(albumCoversCopy);
                    removeMtRush(router.query.username, authToken, spot);
                }}>
                    <Close />
                </Button>}
                <Image isZoomed 
                    src={albumCovers[spot - 1]}
                    width={150} 
                    height={150} 
                    className="w-full h-auto object-cover rounded"
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
    const [pfpLoading, setPfpLoading] = useState(false);
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
    const [profileLoading, setProfileLoading] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure(); // pfp modal
    const { isOpen: newPostModalIsOpen, onOpen: newPostModalOnOpen, onOpenChange: newPostModalOnOpenChange } = useDisclosure();
    const { isOpen: recModalIsOpen, onOpen: recModalOnOpen, onOpenChange: recModalOnOpenChange } = useDisclosure();
    const { isOpen: trackModalIsOpen, onOpen: trackModalOnOpen, onOpenChange: trackModalOnOpenChange } = useDisclosure();
    const [profileStat, setProfileStat] = useState({count: 0, name: "followers"});
    const [lastFMUrl, setLastFMUrl] = useState("");
    const [currentlyListening, setCurrentlyListening] = useState("");
    const [mtRushLoaded, setMtRushLoaded] = useState(false);
    const [initialFeedLoading, setInitialFeedLoading] = useState(true);
    const [initialFeed, setInitialFeed] = useState([]);

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
            let resizedPfpB64;

            if (pfp != "") {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 800,
                    useWebWorker: true
                }
                const resizedPfp = await imageCompression(pfp, options)
                const reader = new FileReader()
                resizedPfpB64 = await new Promise(r=>{reader.onload=()=>r(reader.result.split(",")[1]);reader.readAsDataURL(resizedPfp)})
            }

            const response = axios.post("/api/pfp", {
                username,
                pfp: resizedPfpB64 || ""
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

    async function pullCurrentlyListening(username) {
        try {
            console.log(username);
            const response = await axios.get("/api/pullCurrentlyListening", {
                params: {
                    username,
                }
            });
            
            return response.data.message;
        } catch (err) {
            if (err.response) {
                return "Error";
            } else {
                return "Error";
            }
        }
    }

    useEffect(() => {
        async function initializeProfile() {
            if (!router.query.username) return;
            
            const storedAuthToken = window.localStorage.getItem("authToken");
            setAuthToken(storedAuthToken);
            
            try {
                const [userData, likesData, mtRushData, feedData, listening] = await Promise.allSettled([
                    checkUser(
                        router.query.username,
                        storedAuthToken,
                        window.localStorage.getItem("username")
                    ),
                    checkLikes(window.localStorage.getItem("username")),
                    getMtRush(router.query.username),
                    getFeed(router.query.username, 1),
                    pullCurrentlyListening(window.localStorage.getItem("username"))
                ]);

                if (userData.status !== "fulfilled" || !userData.value) {
                    set404(true);
                    return;
                }

                setBio(userData.value.bio);
                setPfp(userData.value.pfp);
                setMe(userData.value.me);
                setFollowing(userData.value.following);
                setProfileStat({
                    count: userData.value.followers,
                    name: `follower${userData.value.followers === 1 ? '' : 's'}`
                });

                if (likesData.status === "fulfilled") {
                    setLiked(likesData.value.likes || []);
                }
                if (mtRushData.status === "fulfilled") {
                    setAlbumCovers(mtRushData.value?.data?.mtRush || []);
                    setMtRushLoaded(true);
                }
                if (feedData.status === "fulfilled") {
                    setInitialFeed(feedData.value.posts || []);
                }
                
                if (listening.status === "fulfilled") {
                    if (listening.value === 0) {
                        const lastFMData = await getLastFMUrl(router.query.username);
                        setLastFMUrl(lastFMData?.url || "");
                    } else {
                        setCurrentlyListening(listening.value || "");
                    }
                }
            } catch (error) {
                console.error("Profile initialization error:", error);
                set404(true);
            } finally {
                setProfileLoading(true);
                setInitialFeedLoading(false);
            }
        }

        initializeProfile();
    }, [router.query.username, router.query.token]);

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
                    <Skeleton className="rounded-3xl" isLoaded={profileLoading}>
                        <Card className="lg:w-[32vw] w-[90vw]">
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
                                                                <Button color="danger" variant="light" onPress={async () => {
                                                                    setPfpLoading(true);
                                                                    const result = await changePfp(username, authToken, "");
                                                                    if (result.status == 200) {
                                                                        setPfp("");
                                                                    } else {
                                                                        console.log(result.error);
                                                                    }
                                                                    setPfpLoading(false);
                                                                    onClose();
                                                                }}>
                                                                Clear Avatar
                                                                </Button>
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
                                {editing && <Button color="secondary" className="mr-2" onPress={async () => {
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

                                {me && (lastFMUrl ? <a href={lastFMUrl}><LastFMButton /></a> : <p>{currentlyListening}</p>)}
                            </CardFooter>
                        </Card>
                    </Skeleton>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <h2>Mount Rushmore</h2>
                    
                    <Skeleton className="rounded-3xl" isLoaded={mtRushLoaded}>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array(4).fill(1).map((_, i) => (
                                <div className="w-[150px] h-[150px]">
                                <MtRush
                                    key={i + 1}
                                    spot={i + 1}
                                    albumCovers={albumCovers}
                                    setAlbumCovers={setAlbumCovers}
                                    router={router}
                                    authToken={authToken}
                                    me={me}
                                />
                                </div>
                            ))}
                        </div>
                    </Skeleton>

                    <h2 className="mt-12">Feed</h2>

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
                    
                    {initialFeedLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Spinner size="lg" color="secondary" />
                        </div>
                    ) : (
                        <Feed 
                            username={username}
                            authToken={authToken}
                            initialFeed={initialFeed}
                            initialLiked={liked}
                        />
                    )}
                </div>
            </>
            }

        </main>

        <Footer />
  </div>;
}
