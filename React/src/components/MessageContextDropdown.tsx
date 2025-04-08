import React from "react";
import { User } from "../../../Types/userTypes";
import { Message, Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";
import classes from "../styles/application.module.css";
import { checkPermissions } from "@/util/functions";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
interface MessageContextDropdownProps {
        message: Message;
        server: Server | null | undefined;
        session: User | null | undefined;
        dropdownX: number;
        dropdownY: number;
        setDropdownVisible: (visible: boolean) => void;
        setEditMode: (mode: boolean) => void;
}

const MessageContextDropdown: React.FC<MessageContextDropdownProps> = ({
    message,
    session,
    server,
    dropdownX,
    dropdownY,
    setDropdownVisible,
    setEditMode
}) => {
    const isSelf = session?.id === message.authorId; // Check if the user is the same as the session user
    const isAdmin = server ? checkPermissions(
                          server,
                          session!.id,
                          session!.roles!,
                          Permissions.ADMIN
                        ) : false;
    const handleDeleteMessage = () => {
        ApiClient.getInstance().deleteMessage(message.id, Cookies.get("access_token") || "").then((response) => {
            console.log(response);
        });
        setDropdownVisible(false);
    };

    const handleEditMessage = () => {
        setEditMode(true);
        setDropdownVisible(false);
    };
    
        return (
            <ul
                className={classes.custom_dropdown}
                style={{
                    top: dropdownY,
                    left: dropdownX,
                }}
            >
                {(isSelf || isAdmin) && <li onClick={() => handleDeleteMessage()}>Delete Message</li>}
                {isSelf && <li onClick={() => handleEditMessage()}>Edit Message</li>}
            </ul>
        );
};


export default MessageContextDropdown;