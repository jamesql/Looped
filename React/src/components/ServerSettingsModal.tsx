import React from 'react';
import classes from "../styles/friendsmodal.module.css"
import { Server } from '../../../Types/serverTypes';
import ApiClient from '@/util/api';
import Cookies from 'js-cookie';

interface ServerSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen,  setClose, server}) => {
    const [serverName, setServerName] = React.useState(server.name);
    const [serverDesc, setServerDesc] = React.useState(server.description || "");
    const [serverIcon, setServerIcon] = React.useState(server.icon);
    const [serverBanner, setServerBanner] = React.useState(server.banner);

    const handleSubmit = async (e: any) => {
        console.log(serverName);

        const token = Cookies.get("access_token") || "";
        await ApiClient.getInstance().editServer(
            server.id,
            serverName,
            serverDesc,
            serverIcon,
            serverBanner,
            token
        ).then((response) => {
            console.log(response);
        }
        );

        setClose(false);
    };

    const handleGenInvite = async (e: any) => {
        console.log("Generating invite code...");
        const token = Cookies.get("access_token") || "";

        const result = await ApiClient.getInstance().generateInviteCode(server.id, token);
        const inviteCode = result.data.code;
        console.log(inviteCode);

        // copy to clipboard
        navigator.clipboard.writeText(inviteCode);

        alert(`Invite Code: ${inviteCode}, copied to clipboard!`);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Edit Server Settings</h2>
                <input
                    type="text"
                    defaultValue={server.name.toString()}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder={server.name}
                />
                <input
                    type="text"
                    defaultValue={server.description}
                    onChange={(e) => setServerDesc(e.target.value)}
                    placeholder={server.description}
                />
                <input
                    type="text"
                    defaultValue={server.icon}
                    onChange={(e) => setServerIcon(e.target.value)}
                    placeholder={server.icon}
                />
                <input
                    type="text"
                    defaultValue={server.banner}
                    onChange={(e) => setServerBanner(e.target.value)}
                    placeholder={server.banner}
                />
                <button onClick={(e) => handleGenInvite(e)}>Generate Invite Code</button>


                <button onClick={(e) => handleSubmit(e)}>Submit</button>
            </div>
        </div>
    );
};

export default ServerSettingsModal;