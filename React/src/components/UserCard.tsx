import { User } from "../../../Types/userTypes";
import React, { useState, useEffect } from "react";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";

interface UserCardProps {
  user: User;
  is_admin : boolean;
  is_self: boolean; 
  is_friend: boolean;
  incoming_request: boolean;
  outgoing_request: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, is_admin, is_self, is_friend, incoming_request, outgoing_request }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default right-click menu

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 150; // Approximate width of the dropdown
    const dropdownHeight = 100; // Approximate height of the dropdown
  
    let x = e.pageX;
    let y = e.pageY;
  
    if (x + dropdownWidth > viewportWidth) {
      x = viewportWidth - dropdownWidth - 10; // Add some padding
    }
    if (y + dropdownHeight > viewportHeight) {
      y = viewportHeight - dropdownHeight - 10; // Add some padding
    }
  
    setDropdownPosition({ x, y });
    setDropdownVisible(true);
};

  const handleClickOutside = () => {
    setDropdownVisible(false);
  };

  const handleAddFriend = async () => {
    // Function to send a friend request
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().sendFriendRequest(user.id, access_token);
      setDropdownVisible(false); // Close the dropdown after sending the request
      console.log("Friend request sent to", user.firstName, user.lastName);
    } catch (error) {
      // Handle error
      console.error("Failed to send friend request:", error);
    }
  };

  const handleRemoveFriend = async () => {
    // Function to remove a friend
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().removeFriend(user.id, access_token);
      setDropdownVisible(false); // Close the dropdown after removing the friend
      console.log("Friend removed:", user.firstName, user.lastName);
    } catch (error) {
      // Handle error
      console.error("Failed to remove friend:", error);
    }
  }

  const handleAccept = async () => {
    // Function to accept a friend request
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().acceptFriendRequest(user.id, access_token);
      setDropdownVisible(false); // Close the dropdown after accepting the request
      console.log("Friend request accepted from", user.firstName, user.lastName);
    } catch (error) {
      // Handle error
      console.error("Failed to accept friend request:", error);
    }
  }

  const handleDecline = async () => {
    // Function to decline a friend request
    const access_token = Cookies.get("access_token");
    if (!access_token) {
      console.error("No access token found");
      return;
    }
    try {
      await ApiClient.getInstance().declineFriendRequest(user.id, access_token);
      setDropdownVisible(false); // Close the dropdown after declining the request
      console.log("Friend request declined from", user.firstName, user.lastName);
    } catch (error) {
      // Handle error
      console.error("Failed to decline friend request:", error);
    }
  }

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownVisible]);

    const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
    useEffect(() => { 
      if (user.avatar) {
        getCdnFileUrl(user.avatar).then(url => {
          setAvatarUrl(url);
        });
      } else {
        setAvatarUrl("/logo_main.jpg");
      }
    }
    , [user.avatar]);
  

  return (
    <li
      className={classes.member_card}
      onContextMenu={handleContextMenu} // Handle right-click
    >
      <div className={classes.member_image}>
        <img
          className={classes.squircle}
          src={avatarUrl}
          alt=""
        />
      </div>
      <div className={classes.member_info}>
        <h3>
          {user.firstName} {user.lastName}
        </h3>
        <h4>{user.status}</h4>
      </div>

      {/* Custom Dropdown */}
      {dropdownVisible && (
        <ul
          className={classes.custom_dropdown}
          style={{ top: dropdownPosition.y, left: dropdownPosition.x }}
        >
          <li onClick={() => console.log("View Profile")}>View Profile</li>


          {/** Friend Request Buttons  */}
          {!is_self && is_friend && <li onClick={() => handleRemoveFriend()}>Remove Friend</li>}
          {!is_self && incoming_request && <li onClick={() => handleAccept()}>Accept Request</li>}
          {!is_self && incoming_request && <li onClick={() => handleDecline()}>Deny Request</li>}          
          {!is_self && !is_friend && (!incoming_request && !outgoing_request) && <li onClick={() => handleAddFriend()}>Add Friend</li>}

          {/** Moderation tools  */}
          {!is_self && <li onClick={() => console.log({incoming_request, outgoing_request, is_friend})}>Report</li>}
          {is_admin && !is_self && <li onClick={() => console.log("Ban")}>Ban</li>}
          {is_admin && !is_self && <li onClick={() => console.log("Kick")}>Kick</li>}
        </ul>
      )}
    </li>
  );
};

export default UserCard;