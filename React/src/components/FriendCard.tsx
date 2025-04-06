import { User } from "../../../Types/userTypes";
import React, { useState, useEffect } from "react";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import Cookies from "js-cookie";
import ApiClient from "@/util/api";

interface FriendCardProps {
  user: User;
  clickFunc?: (u: User) => void; // Optional onClick prop
  active: boolean;
  handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const FriendCard: React.FC<FriendCardProps> = ({
  user,
  clickFunc,
  active,
  handleProfileCard,
}) => {
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

  const handleClickOutsideMenu = () => {
    setDropdownVisible(false);
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
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("click", handleClickOutsideMenu);
    } else {
      document.removeEventListener("click", handleClickOutsideMenu);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideMenu);
    };
  }, [dropdownVisible]);

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
    <li
      className={[
        classes.member_card,
        active ? classes.member_card_active : "",
      ].join(" ")}
      onContextMenu={handleContextMenu} // Handle right-click
      onClick={
        clickFunc
          ? () => clickFunc(user)
          : (e) => {
              if(handleProfileCard)
                 handleProfileCard(e, user);
            }
      }
    >
      <div className={classes.member_image}>
        <img
          className={classes.squircle}
          src={avatarUrl}
          alt=""
          onClick={(e) => {
            if(handleProfileCard)
              handleProfileCard(e, user);
          }}
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
          <li onClick={() => handleRemoveFriend()}>Remove Friend</li>
        </ul>
      )}
    </li>
  );
};

export default FriendCard;
