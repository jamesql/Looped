import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Server, Channel } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";
import { getCdnFileUrl } from "../util/functions";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
import { User } from "../../../Types/userTypes";

interface ServerIconProps {
    server: Server;
    setSelectedServer: (server: Server | null) => void;
    setSelectedChannel: (channel: Channel | null) => void;
    selectedServer: Server | null;
    selectedChannel: Channel | null;
    handleDockMouseEnter: (
        e: React.MouseEvent<HTMLDivElement>,
        str: string
    ) => void;
    handleMouseLeave: () => void;
    handleServerLeave?: (server: Server) => void; // Optional prop for handling server leave
    session: User
}

const ServerIcon: React.FC<ServerIconProps> = ({
    server,
    setSelectedServer,
    setSelectedChannel,
    selectedServer,
    handleDockMouseEnter,
    handleMouseLeave,
    handleServerLeave,
    session
}) => {
    const [serverIconUrl, setServerIconUrl] = useState<string>("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (server.icon) {
            getCdnFileUrl(server.icon).then((url) => {
                setServerIconUrl(url);
            });
        } else {
            setServerIconUrl("/logo_main.jpg");
        }
    }, [server.icon]);

    const isActive = selectedServer && selectedServer.id === server.id;

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the default right-click menu
        const x = e.clientX;
        const y = e.clientY;
        if(session.id !== server.ownerId)
        {
          setDropdownPosition({ x, y });
          setDropdownVisible(true);       
        }
    };

    const handleLeaveServer = async () => {
        console.log(`Leaving server: ${server.name}`);
        ApiClient.getInstance()
            .leaveServer(server.id, Cookies.get("access_token") || "")
            .then(() => {
                if (handleServerLeave) handleServerLeave(server);
            });

        setDropdownVisible(false);
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
        <>
            <div
                className={classes.dock_icon_wrapper}
                onContextMenu={handleContextMenu}
            >
                {isActive && <div className={classes.selected_indicator}></div>}
                <div
                    className={[
                        classes.dock_icon,
                        isActive ? classes.dock_icon_active : "",
                    ].join(" ")}
                    onMouseEnter={(e) => handleDockMouseEnter(e, server.name)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => {
                        setSelectedServer(server);
                        setSelectedChannel(
                            server.channels && server.channels.length > 0
                                ? server.channels[0]
                                : null
                        );
                    }}
                >
                    <img
                        src={serverIconUrl}
                        className={classes.dock_icon_img}
                        alt={server.name}
                    />
                </div>
            </div>

            {dropdownVisible && 
                createPortal(
                    <ul
                        className={classes.custom_dropdown}
                        style={{
                            top: dropdownPosition.y,
                            left: dropdownPosition.x,
                        }}
                    >
                        <li
                            className={classes.dropdown_item}
                            onClick={handleLeaveServer}
                        >
                            Leave Server
                        </li>
                    </ul>,
                    document.body // Render the dropdown in the body
                )}
        </>
    );
};

export default ServerIcon;
