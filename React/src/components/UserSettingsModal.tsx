import React, { useEffect, useState } from "react";
import classes from "../styles/usersettingsmodal.module.css";
import { User } from "../../../Types/userTypes";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
import { getCdnFileUrl, uploadCdnFile } from "@/util/functions";
import { MdClose, MdCloudUpload } from "react-icons/md";
import FileDropper from "./FileDropper";

interface UserSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    user: User | undefined;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
    isOpen,
    setClose,
    user,
}) => {
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [location, setLocation] = useState(user?.location || "");
    const [status, setStatus] = useState(user?.status || "");
    const [avatarFile, setAvatarFile] = useState(user?.avatar || null);
    const [skills, setSkills] = useState(user?.skills || []);
    const [avatarUrl, setAvatarUrl] = useState<string>("/logo_main.jpg");
    const [imgHover, setImgHover] = useState<boolean>(false);

    useEffect(() => {
        if (avatarFile) {
          getCdnFileUrl(avatarFile).then((url) => {
            setAvatarUrl(url);
          });
        } else {
            setAvatarUrl("/logo_main.jpg");
        }
      }, [avatarFile]);

    if (!user) return null;

    
        
     
    const userAvatarFileChangeNew = async (files: FileList) => {
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setAvatarFile(cdnResp.r2file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // get token
        const token = Cookies.get("access_token");

        if (!token) {
            alert("You must be logged in to edit your profile.");
            return;
        }

        await ApiClient.getInstance().editUser(
            firstName,
            lastName,
            location,
            status,
            token,
            skills,
            avatarFile?.id
        );
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <div className={classes.modal_header}>
                    <h2>User Settings</h2>
                    <span
                        className={classes.close}
                        onClick={() => setClose(false)}
                    >
                        &times;
                    </span>
                </div>
                <form onSubmit={handleSubmit}>
                    <label>
                        First Name:
                        <input
                            type="text"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </label>
                    <label>
                        Location:
                        <input
                            type="text"
                            name="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </label>
                    <label>
                        Status:
                        <input
                            type="text"
                            name="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                    </label>
                    <label>
                        Skills:
                        <div>
                            <div className={classes.skills}>
                                {skills.map((skill, index) => (
                                    <div
                                        key={index}
                                        className={classes.skill_tag}
                                        onClick={() =>
                                            setSkills(
                                                skills.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                    >
                                        {skill}
                                        <MdClose />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className={classes.skill_input_bar}>
                                    <input
                                        type="text"
                                        placeholder="Enter a skill"
                                        id="newSkillInput"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input =
                                                    e.target as HTMLInputElement;
                                                if (input && input.value.trim()) {
                                                    setSkills([
                                                        ...skills,
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
                                            const input = document.getElementById(
                                                "newSkillInput"
                                            ) as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                                setSkills([
                                                    ...skills,
                                                    input.value.trim(),
                                                ]);
                                                input.value = "";
                                            }
                                        }}
                                        className={[classes.button, classes.skill_input_bar_button].join(" ")}
                                    >
                                        Add Skill
                                    </button>
                                </div>
                            </div>
                        </div>
                    </label>
                    <label>
                        Avatar:
                        <div className={classes.user_avatar_container}>
                            <FileDropper onFilesDropped={userAvatarFileChangeNew} accept=".png,.jpg,.jpeg,.gif">
                                <div 
                                    className={classes.user_avatar} 
                                    onMouseEnter={() => setImgHover(true)} 
                                    onMouseLeave={() => setImgHover(false)}
                                >
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        className={classes.user_avatar_img}
                                    />
                                    {imgHover && (
                                        <div className={classes.overlay_icon}>
                                            <MdCloudUpload
                                                size={24} 
                                                onClick={() => setAvatarFile(null)} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </FileDropper>
                        </div>
                    </label>
                    <button type="submit" className={classes.button}>
                        Save Changes
                    </button>
                </form>
                <div>
                    <button
                        onClick={async () => {
                            Cookies.remove("refresh_token");
                            Cookies.remove("access_token");
                            window.location.href = "/login";
                        }}
                        className={classes.button}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;
