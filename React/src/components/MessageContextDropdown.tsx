import React, { useState } from "react";
import { User } from "../../../Types/userTypes";
import { Message, Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";
import classes from "../styles/application.module.css";
import { checkPermissions } from "@/util/functions";

interface MessageContextDropdownProps {
        message: Message;
        server: Server | null | undefined;
        session: User | null | undefined;
        dropdownX: number;
        dropdownY: number;
        setDropdownVisible: (visible: boolean) => void;
    
}

const MessageContextDropdown: React.FC<MessageContextDropdownProps> = ({
    message,
    session,
    server,
    dropdownX,
    dropdownY,
    setDropdownVisible
}) => {
    const isSelf = session?.id === message.authorId; // Check if the user is the same as the session user
    const isAdmin = server ? checkPermissions(
                          server,
                          session!.id,
                          session!.roles!,
                          Permissions.ADMIN
                        ) : false;
    const handleDeleteMessage = () => {
        setDropdownVisible(false);
    };

    const handleEditMessage = () => {
        setDropdownVisible(false);
    };
    if(isSelf || isAdmin)
        return (
            <ul
                className={classes.custom_dropdown}
                style={{
                    top: dropdownY,
                    left: dropdownX,
                }}
            >
                <li onClick={() => handleDeleteMessage()}>Delete Message</li>
                <li onClick={() => handleEditMessage()}>Edit Message</li>
            </ul>
        );
};


export default MessageContextDropdown;