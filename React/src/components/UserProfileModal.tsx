import React, { useEffect, useState } from "react";
import { User } from "../../../Types/userTypes";
import modalClasses from "../styles/userprofilemodal.module.css";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import {
    MdMessage,
    MdPersonAdd,
    MdClose,
    MdCheck,
    MdPersonRemove,
} from "react-icons/md";
import { createPortal } from "react-dom";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";

interface UserProfileModalProps {
    user: User | null;
    x: number;
    y: number;
    session?: User | null | undefined;
    handleSetDirectMessage: (user: User) => void; // Optional prop for handling direct message click
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
    user,
    x,
    y,
    session,
    handleSetDirectMessage,
}) => {
    const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");

    const [zoomUrl, setZoomUrl] = useState<string>("");
    const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);

    useEffect(() => {
        if (user?.avatar) {
            getCdnFileUrl(user?.avatar).then((url) => {
                setAvatarUrl(url);
            });
        } else {
            setAvatarUrl("/logo_main.jpg");
        }
    }, [user?.avatar]);

    const [portfolioUrls, setportfolioUrls] = useState<string[]>([
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
        "/logo_main.jpg",
    ]);

    useEffect(() => {
        const updatePortfolioUrls = async () => {
            try {
                if (user?.portfolioCdnImages) {
                    const urls = await Promise.all(
                        user?.portfolioCdnImages.map((item) =>
                            item ? getCdnFileUrl(item) : "/logo_main.jpg"
                        )
                    );
                    setportfolioUrls(urls);
                }
            } catch (error) {
                console.error("Error fetching portfolio image URLs:", error);
            }
        };

        updatePortfolioUrls();
    }, [user?.portfolioCdnImages]);

    const handleAddFriend = async (user: User) => {
        // Function to send a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().sendFriendRequest(
                user.id,
                access_token
            );
            console.log(
                "Friend request sent to",
                user.firstName,
                user.lastName
            );
        } catch (error) {
            // Handle error
            console.error("Failed to send friend request:", error);
        }
    };

    const handleRemoveFriend = async (user: User) => {
        // Function to remove a friend
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().removeFriend(user.id, access_token);
            console.log("Friend removed:", user.firstName, user.lastName);
        } catch (error) {
            // Handle error
            console.error("Failed to remove friend:", error);
        }
    };

    const handleAccept = async (user: User) => {
        // Function to accept a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().acceptFriendRequest(
                user.id,
                access_token
            );
            console.log(
                "Friend request accepted from",
                user.firstName,
                user.lastName
            );
        } catch (error) {
            // Handle error
            console.error("Failed to accept friend request:", error);
        }
    };

    const handleDecline = async (user: User) => {
        // Function to decline a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().declineFriendRequest(
                user.id,
                access_token
            );
        } catch (error) {
            // Handle error
            console.error("Failed to decline friend request:", error);
        }
    };

    const skills = user?.skills || [];
    const isSelf = session?.id === user?.id; // Check if the user is the same as the session user
    const isFriend = session?.friends
        ? session?.friends.some((u) => u.id === user?.id)
        : false;
    const incomingRequest = session?.friendRequestsReceived
        ? session?.friendRequestsReceived.some(
              (request) => request.id === user?.id
          )
        : false; // Check if the user has sent a friend request to this member
    const outgoingRequest = session?.friendRequestsSent
        ? session?.friendRequestsSent.some((request) => request.id === user?.id)
        : false; // Check if this member has sent a friend request to the user
    return (
        <>
            <div
                className={modalClasses.user_profile_card}
                style={{ top: y, left: x }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={modalClasses.user_main_info}>
                    <img className={classes.squircle} src={avatarUrl} alt="" />
                    <div className={modalClasses.user_sub_info}>
                        <h4>
                            {user?.firstName} {user?.lastName}
                        </h4>
                        <h5>{user?.status}</h5>
                    </div>
                </div>

                <div className={modalClasses.action_button_row}>
                    {/* Add Friend Button */}
                    {!outgoingRequest &&
                        !isFriend &&
                        !isSelf &&
                        !incomingRequest && (
                            <button
                                className={modalClasses.icon_button}
                                onClick={() => handleAddFriend(user!)}
                            >
                                <MdPersonAdd className={modalClasses.icon} />
                            </button>
                        )}

                    {/* Remove Friend Button */}
                    {!isSelf && isFriend && (
                        <button
                            className={modalClasses.icon_button}
                            onClick={() => handleRemoveFriend(user!)}
                        >
                            <MdPersonRemove className={modalClasses.icon} />
                        </button>
                    )}

                    {/* Accept Friend Request Button */}
                    {!isSelf && incomingRequest && (
                        <button
                            className={modalClasses.icon_button}
                            onClick={() => handleAccept(user!)}
                        >
                            <MdCheck className={modalClasses.icon} />
                        </button>
                    )}

                    {/* Decline Friend Request Button */}
                    {!isSelf && incomingRequest && (
                        <button
                            className={modalClasses.icon_button}
                            onClick={() => handleDecline(user!)}
                        >
                            <MdClose className={modalClasses.icon} />
                        </button>
                    )}

                    {/* Message Friend Button */}
                    {!isSelf && isFriend && (
                        <button
                            className={modalClasses.icon_button}
                            onClick={() => {
                                // Add logic to open a chat or message modal
                                handleSetDirectMessage(user!);
                            }}
                        >
                            <MdMessage className={modalClasses.icon} />
                        </button>
                    )}
                </div>
                {portfolioUrls.length !== 0 && (
                    <>
                        <h4>Portfolio</h4>
                        <div className={modalClasses.portfolio_grid}>
                            {portfolioUrls.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt="Portfolio Image"
                                    className={modalClasses.portfolio_image}
                                    onClick={() => {
                                        setZoomUrl(url);
                                        setIsImageZoomed(true);
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
                {skills.length !== 0 && (
                    <>
                        <h4>Skills</h4>
                        <div className={modalClasses.skills_grid}>
                            {skills.map((skill, index) => (
                                <div
                                    key={index}
                                    className={modalClasses.skill_tag}
                                >
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {isImageZoomed &&
                createPortal(
                    <div
                        className={classes.image_zoom_overlay}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsImageZoomed(false);
                        }}
                    >
                        <img
                            className={classes.image_zoom}
                            src={zoomUrl}
                            alt="Zoomed"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>,
                    document.body
                )}
        </>
    );
};

export default UserProfileModal;
