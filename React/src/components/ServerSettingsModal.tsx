import React, { useEffect, useState } from 'react';
import classes from "../styles/friendsmodal.module.css"
import { Server } from '../../../Types/serverTypes';
import ApiClient from '@/util/api';
import Cookies from 'js-cookie';
import { getCdnFileUrl, uploadCdnFile } from '@/util/functions';
import FileDropper from './FileDropper';
import { MdClose, MdCloudUpload } from 'react-icons/md';

interface ServerSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    server: Server;
    onServerDeleteCallback?: (server: Server) => void; // Optional prop for handling server leave
}

const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({ isOpen,  setClose, server, onServerDeleteCallback}) => {
    const [serverName, setServerName] = React.useState(server.name);
    const [serverDesc, setServerDesc] = React.useState(server.description || "");
    const [serverWebsite, setServerWebsite] = React.useState(server.website || "");
    const [serverTags, setServerTags] = React.useState(server.tags || []);
    const [serverPrivate, setServerPrivate] = React.useState(server.private);
    const [serverBanner, setServerBanner] = useState(server.banner || null);
    const [serverIcon, setServerIcon] = useState(server.icon || null);
    const [iconUrl, setIconUrl] = useState<string>("/logo_main.jpg");
    const [bannerUrl, setBannerUrl] = useState<string>("/logo_main.jpg");
    const [iconImgHover, setIconImgHover] = useState<boolean>(false);
    const [bannerImgHover, setBannerImgHover] = useState<boolean>(false);

    const handleSubmit = async () => {
        console.log(serverName);

        const token = Cookies.get("access_token") || "";
        await ApiClient.getInstance().editServer(
            server.id,
            serverName,
            serverDesc,
            serverWebsite,
            serverTags,
            token,
            serverIcon ? serverIcon.id : "",
            serverBanner ? serverBanner.id : "",
            serverPrivate
        ).then((response) => {
            console.log(response);
        }
        );

        setClose(false);
    };

    const handleGenInvite = async () => {
        console.log("Generating invite code...");
        const token = Cookies.get("access_token") || "";

        const result = await ApiClient.getInstance().generateInviteCode(server.id, token);
        const inviteCode = result.data.code;
        console.log(inviteCode);

        // copy to clipboard
        navigator.clipboard.writeText(inviteCode);

        alert(`Invite Code: ${inviteCode}, copied to clipboard!`);
    };

    const onServerDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this server?");
        if (!confirmDelete) return;

        const token = Cookies.get("access_token") || "";
        try {
            await ApiClient.getInstance().deleteServer(server.id, token);
            setClose(false);
            if(onServerDeleteCallback)
                onServerDeleteCallback(server); // Call the callback function if provided
        } catch (error) {
            console.error("Error deleting server:", error);
            alert("Failed to delete the server. Please try again.");
        }
    };

    const serverIconFileChange = async (
        files: FileList
      ) => {
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setServerIcon(cdnResp.r2file);
        }
      };
    
    const serverBannerFileChange = async (
        files: FileList
      ) => {
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setServerBanner(cdnResp.r2file);
        }
      };

    useEffect(() => {
            if (serverBanner) {
                getCdnFileUrl(serverBanner).then((url) => {
                    setBannerUrl(url);
                });
            } else {
                setBannerUrl("/logo_main.jpg");
            }
        }, [serverBanner]);
    
    useEffect(() => {
            if (serverIcon) {
                getCdnFileUrl(serverIcon).then((url) => {
                    setIconUrl(url);
                });
            } else {
                setIconUrl("/logo_main.jpg");
            }
        }, [serverIcon]);


    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
            <div className={classes.modal_header}>
                    <h2>Server Settings</h2>
                    <div className={classes.close}>
                        <MdClose onClick={() => setClose(false)}></MdClose>
                    </div>
                </div>
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
                <div>
                    Server Icon:
                    <div className={classes.upload_container}>
                        <FileDropper
                            onFilesDropped={serverIconFileChange}
                            accept=".png,.jpg,.jpeg,.gif"
                        >
                            <div
                                className={classes.server_icon}
                                onMouseEnter={() => setIconImgHover(true)}
                                onMouseLeave={() => setIconImgHover(false)}
                            >
                                <img
                                    src={iconUrl}
                                    alt="Server Bammer"
                                    className={classes.server_icon_img}
                                />
                                {iconImgHover && (
                                    <div className={classes.overlay_icon}>
                                        <MdCloudUpload
                                            size={24}
                                        />
                                    </div>
                                )}
                            </div>
                        </FileDropper>
                    </div>

                    Server Banner:
                    <div className={classes.upload_container}>
                        <FileDropper
                            onFilesDropped={serverBannerFileChange}
                            accept=".png,.jpg,.jpeg,.gif"
                        >
                            <div
                                className={classes.server_banner}
                                onMouseEnter={() => setBannerImgHover(true)}
                                onMouseLeave={() => setBannerImgHover(false)}
                            >
                                <img
                                    src={bannerUrl}
                                    alt="Server Banner"
                                    className={classes.server_icon_img}
                                />
                                {bannerImgHover && (
                                    <div className={classes.overlay_banner}>
                                        <MdCloudUpload
                                            size={24}
                                        />
                                    </div>
                                )}
                            </div>
                        </FileDropper>
                    </div>
                </div>
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
                            <div className={classes.skills}>
                                {serverTags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className={classes.skill_tag}
                                        onClick={() =>
                                            setServerTags(
                                                serverTags.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                    >
                                        {tag}
                                        <MdClose />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className={classes.skill_input_bar}>
                                    <input
                                        type="text"
                                        placeholder="Enter a tag"
                                        id="newSkillInput"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input =
                                                    e.target as HTMLInputElement;
                                                if (
                                                    input &&
                                                    input.value.trim()
                                                ) {
                                                    setServerTags([
                                                        ...serverTags,
                                                        input.value.trim(),
                                                    ]);
                                                    input.value = "";
                                                }
                                            }
                                        }}
                                        className={classes.skill_input}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input =
                                                document.getElementById(
                                                    "newSkillInput"
                                                ) as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                setServerTags([
                                                    ...serverTags,
                                                    input.value.trim(),
                                                ]);
                                                input.value = "";
                                            }
                                        }}
                                        className={[
                                            classes.button,
                                            classes.skill_input_bar_button,
                                        ].join(" ")}
                                    >
                                        Add Tag
                                    </button>
                                </div>
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
                <button onClick={() => handleGenInvite()} className={classes.button}>Generate Invite Code</button>
                <button onClick={() => onServerDelete()} className={classes.button}>Delete Server</button>
                <button onClick={() => handleSubmit()} className={classes.button}>Submit</button>
            </div>
        </div>
    );
};

export default ServerSettingsModal;