import { User } from "../../../Types/userTypes";
import React, { useState, useEffect } from "react";
import classes from "../styles/application.module.css";

interface UserCardProps {
  user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default right-click menu
    setDropdownPosition({ x: e.pageX, y: e.pageY });
    setDropdownVisible(true);
  };

  const handleClickOutside = () => {
    setDropdownVisible(false);
  };

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

  return (
    <li
      className={classes.member_card}
      onContextMenu={handleContextMenu} // Handle right-click
    >
      <div className={classes.member_image}>
        <img
          className={classes.squircle}
          src={user.avatar ? user.avatar : "/logo_main.jpg"}
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
          <li onClick={() => console.log("Send Message")}>Send Message</li>
          <li onClick={() => console.log("Remove User")}>Remove User</li>
        </ul>
      )}
    </li>
  );
};

export default UserCard;