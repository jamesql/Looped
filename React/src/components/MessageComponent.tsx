import classes from "../styles/application.module.css";
import React, { useState, useEffect } from "react";
import { Message, Server } from "../../../Types/serverTypes";
import { MdCheck, MdClose, MdDownload } from "react-icons/md";
import prettyBytes from "pretty-bytes";
import { getCdnFileUrl } from "@/util/functions";
import { User } from "../../../Types/userTypes";
import { createPortal } from "react-dom";
import UserContextDropdown from "./UserContextDropdown";
import MessageContextDropdown from "./MessageContextDropdown";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";

interface MessageComponentProps {
    message: Message;
    session: User | null | undefined;
    selectedServer?: Server | null;
    handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const supportedImageTypes = new Set([
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
]);

const MessageComponent: React.FC<MessageComponentProps> = ({
    message,
    handleProfileCard,
    session,
    selectedServer,
}) => {
    const [fileUrl, setFileUrl] = useState<string>();
    const [authorAvatarUrl, setAuthorAvatarUrl] =
        useState<string>("/logo_main.jpg");
    const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);
    const [userDropdownVisible, setUserDropdownVisible] = useState(false);
    const [msgDropdownVisible, setMsgDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    const truncateFileName = (
        fileName: string,
        maxLength: number = 20
    ): string => {
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.slice(fileName.lastIndexOf("."));
        const baseName = fileName.slice(0, maxLength - extension.length - 3); // Reserve space for "..."
        return `${baseName}...${extension}`;
    };

    useEffect(() => {
        if (message.file)
            getCdnFileUrl(message.file).then((url) => {
                setFileUrl(url);
            });
    }, [message.file]);

    useEffect(() => {
        const fetchAvatarUrl = async () => {
            if (message.author?.avatar) {
                const url = await getCdnFileUrl(message.author.avatar);
                setAuthorAvatarUrl(url);
            }
        };
        fetchAvatarUrl();
    }, [message.author?.avatar]);

    useEffect(() => {
        if (userDropdownVisible) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [userDropdownVisible]);

    useEffect(() => {
        if (msgDropdownVisible) {
            document.addEventListener("click", handleClickOutside);
        } else {
            document.removeEventListener("click", handleClickOutside);
        };

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [msgDropdownVisible]);

    const handleImageClick = () => {
        setIsImageZoomed(true);
    };

    const closeImageZoom = () => {
        setIsImageZoomed(false);
    };

    if (!message?.author) return null;

    const renderFilePreview = () => {
        const file = message.file;
        if (!file || !fileUrl) return null;

        const fileName = file.fileName ?? "File";

        if (supportedImageTypes.has(file.contentType)) {
            return (
                <div className={classes.message_image_container}>
                    <img
                        className={classes.message_image}
                        src={fileUrl}
                        alt={fileName}
                        onClick={handleImageClick}
                    />
                    <div className={classes.message_image_caption}>
                        {truncateFileName(fileName)}
                    </div>
                </div>
            );
        }

        if (file.contentType === "video/mp4") {
            return (
                <div className={classes.message_image_container}>
                    <video
                        className={classes.message_image}
                        controls
                        src={fileUrl}
                    >
                        Your browser does not support the video tag.
                    </video>
                    <div className={classes.message_image_caption}>
                        {truncateFileName(fileName)}
                    </div>
                </div>
            );
        }

        return (
            <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
            >
                <div className={classes.message_attachment_box}>
                    <div className={classes.message_attachment_row}>
                        {truncateFileName(fileName)}
                        <MdDownload
                            className={classes.message_attachment_icon}
                        />
                    </div>
                    {prettyBytes(file.fileSize)}
                </div>
            </a>
        );
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the default right-click menu
        e.stopPropagation();
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
        setUserDropdownVisible(true);
        setMsgDropdownVisible(false);
    };

    const handleMessageContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the default right-click menu
        e.stopPropagation();
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
        setMsgDropdownVisible(true);
        setUserDropdownVisible(false);
    };

    const handleClickOutside = () => {
        setUserDropdownVisible(false);
        setMsgDropdownVisible(false);
    };

    const setEditMode = () => {
        setIsEditing(true);
        setEditedContent(message.content);
    };

    const handleSaveEdit = () => {
        ApiClient.getInstance().editMessage(message.id, editedContent, Cookies.get("access_token") || "");
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedContent(message.content);
    };

    return (
        <>
            <div
                className={classes.message}
                onContextMenu={handleMessageContextMenu}
            >
                <img
                    className={classes.squircle}
                    src={authorAvatarUrl}
                    onContextMenu={handleContextMenu}
                    alt=""
                    onClick={(e) => {
                        if (handleProfileCard && message.author) {
                            handleProfileCard(e, message.author); // Call the function if provided
                        }
                    }}
                />

                <div className={classes.message_details}>
                    <div className={classes.author_details}>
                        <h3>{`${message.author.firstName} ${message.author.lastName}`}</h3>
                        <p>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>

                    <div className={classes.message_content}>
                        {isEditing ? (
                            <div className={classes.edit_mode}>
                                <textarea
                                    value={editedContent}
                                    onChange={(e) =>
                                        setEditedContent(e.target.value)
                                    }
                                    className={classes.edit_textarea}
                                />
                                <div className={classes.edit_buttons}>
                                    <button
                                        onClick={handleSaveEdit}
                                        className={classes.edit_button}
                                    >
                                        <MdCheck className={classes.edit_button_icon}/>
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className={classes.edit_button}
                                    >
                                        <MdClose className={classes.edit_button_icon}/>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p>{message.content}</p>
                                {renderFilePreview()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isImageZoomed &&
                createPortal(
                    <div
                        className={classes.image_zoom_overlay}
                        onClick={closeImageZoom}
                    >
                        <img
                            className={classes.image_zoom}
                            src={fileUrl}
                            alt="Zoomed"
                        />
                    </div>,
                    document.body
                )}
            {/* Custom Dropdown */}
            {userDropdownVisible && selectedServer && (
                <UserContextDropdown
                    user={message.author}
                    server={selectedServer}
                    session={session}
                    dropdownX={dropdownPosition.x}
                    dropdownY={dropdownPosition.y}
                    setDropdownVisible={function (visible: boolean): void {
                        setUserDropdownVisible(visible);
                    }}
                ></UserContextDropdown>
            )}
            {msgDropdownVisible && selectedServer && (
                <MessageContextDropdown
                    message={message}
                    server={selectedServer}
                    session={session}
                    dropdownX={dropdownPosition.x}
                    dropdownY={dropdownPosition.y}
                    setDropdownVisible={function (visible: boolean): void {
                        setMsgDropdownVisible(visible);
                    }}
                    setEditMode={setEditMode}
                ></MessageContextDropdown>
            )}
        </>
    );
};

export default MessageComponent;
