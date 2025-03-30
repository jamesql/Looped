import { User } from "../../../Types/userTypes";
import React, { useState, useEffect } from "react";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
import { MdCheck, MdClose } from "react-icons/md";

interface UserCardProps {
  user: User;
  onAction: (user: User) => void;
}

const FriendRequestCard: React.FC<UserCardProps> = ({ user, onAction }) => {
  const handleAccept = async () => {
    // Function to accept a friend request
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().acceptFriendRequest(user.id, access_token);
      console.log(
        "Friend request accepted from",
        user.firstName,
        user.lastName
      );
      onAction(user);
    } catch (error) {
      // Handle error
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDecline = async () => {
    // Function to decline a friend request
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().declineFriendRequest(user.id, access_token);
      console.log(
        "Friend request declined from",
        user.firstName,
        user.lastName
      );

      onAction(user); // Call the function to remove the user from the list
    } catch (error) {
      // Handle error
      console.error("Failed to decline friend request:", error);
    }
  };

  const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
  useEffect(() => {
    if (user.avatar) {
      getCdnFileUrl(user.avatar).then((url) => {
        setAvatarUrl(url);
      });
    } else {
      setAvatarUrl("/logo_main.jpg");
    }
  }, [user.avatar]);

  return (
    <>
      <div className={classes.friend_request_card}>
        <div className={classes.friend_request_card_info}>
            <div className={classes.member_image}>
            <img className={classes.squircle} src={avatarUrl} alt="" />
            </div>
            <div className={classes.member_info}>
            <h3>
                {user.firstName} {user.lastName}
            </h3>
            <h4>{user.status}</h4>
            </div>
        </div>
        <div className={classes.friend_request_button_container}>
            <button className={classes.friend_request_response_button} onClick={handleAccept}>
                <MdCheck/>
            </button>
            <button className={classes.friend_request_response_button} onClick={handleDecline}>
                <MdClose/>
            </button>
        </div>
      </div>
    </>
  );
};

export default FriendRequestCard;
