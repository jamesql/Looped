import React from 'react';
import classes from "../styles/friendsmodal.module.css"
import { Server } from '../../../Types/serverTypes';
import ApiClient from '@/util/api';
import Cookies from 'js-cookie';
import { uploadCdnFile } from '@/util/functions';

interface ServerSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen,  setClose, server}) => {
    const [serverName, setServerName] = React.useState(server.name);
    const [serverDesc, setServerDesc] = React.useState(server.description || "");
    const [serverIconId, setServerIconId] = React.useState(server.iconId || "");
    const [serverBannerId, setServerBannerId] = React.useState(server.bannerId || "");
    const [serverWebsite, setServerWebsite] = React.useState(server.website || "");
    const [serverTags, setServerTags] = React.useState(server.tags || []);
    const [serverPrivate, setServerPrivate] = React.useState(server.private);

    const handleSubmit = async (e: any) => {
        console.log(serverName);

        const token = Cookies.get("access_token") || "";
        await ApiClient.getInstance().editServer(
            server.id,
            serverName,
            serverDesc,
            serverWebsite,
            serverTags,
            token,
            serverIconId,
            serverBannerId,
            serverPrivate
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

    const serverIconFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setServerIconId(cdnResp.r2file.id);
        }
      };
    
    const serverBannerFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setServerBannerId(cdnResp.r2file.id);
        }
      };


    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Edit Server Settings</h2>
                <label>
                    Server Name:
                    <input
                        type="text"
                        defaultValue={server.name.toString()}
                        onChange={(e) => setServerName(e.target.value)}
                        placeholder={server.name}
                    />
                </label>
                <label>
                    Server Description:
                    <input
                        type="text"
                        defaultValue={server.description}
                        onChange={(e) => setServerDesc(e.target.value)}
                        placeholder={server.description}
                    />
                </label>
                <label>
                    Server Icon:
                    <input
                        type="file"
                        onChange={serverIconFileChange}
                     ></input>
                </label>
                <label>
                    Server Banner:
                    <input
                        type="file"
                        onChange={serverBannerFileChange}
                    />
                </label>
                <label>
                    Server Website:
                    <input
                        type="text"
                        defaultValue={server.website}
                        onChange={(e) => setServerWebsite(e.target.value)}
                        placeholder={server.website}
                     />
                </label>
                <label>
                        Tags:
                        <div>
                            <div className={classes.tags}>
                            {serverTags.map((tag, index) => (
                                <div key={index} className={classes.tag}>
                                    {tag}
                                    <button type="button" onClick={() => setServerTags(serverTags.filter((_, i) => i !== index))}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter a tag"
                                    id="newTagInput"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('newTagInput') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            setServerTags([...serverTags, input.value.trim()]);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    Add Tag
                                </button>
                            </div>
                        </div>
                    </label>
                <label>
                    Private:
                    <input
                        type="checkbox"
                        checked={serverPrivate}
                        onChange={(e) => setServerPrivate(e.target.checked)}
                    />
                </label>
                <button onClick={(e) => handleGenInvite(e)}>Generate Invite Code</button>


                <button onClick={(e) => handleSubmit(e)}>Submit</button>
            </div>
        </div>
    );
};

export default ServerSettingsModal;