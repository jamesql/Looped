import { User } from "../../../Types/userTypes";
import React, { useState, useEffect } from "react";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "@/util/functions";
import UserContextDropdown from "./UserContextDropdown";
import { Server } from "../../../Types/serverTypes";

interface UserCardProps {
    user: User;
    session: User | null | undefined;
    selectedServer: Server | null;
    handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    selectedServer,
    session,
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
            className={classes.member_card}
            onContextMenu={handleContextMenu} // Handle right-click
            onClick={(e) => {
                if (handleProfileCard && !dropdownVisible) 
                    handleProfileCard(e, user); // Call the function if provided
            }}
        >
            <div className={classes.member_image}>
                <img className={classes.squircle} src={avatarUrl} alt="" />
            </div>
            <div className={classes.member_info}>
                <h3>
                    {user.firstName} {user.lastName}
                </h3>
                <h4>{user.status}</h4>
            </div>

            {/* Custom Dropdown */}
            {dropdownVisible && selectedServer && (
                <UserContextDropdown
                    user={user}
                    server={selectedServer}
                    session={session}
                    dropdownX={dropdownPosition.x}
                    dropdownY={dropdownPosition.y}
                    setDropdownVisible={function (visible: boolean): void {
                        setDropdownVisible(visible);
                    }}
                ></UserContextDropdown>
            )}
        </li>
    );
};

export default UserCard;
