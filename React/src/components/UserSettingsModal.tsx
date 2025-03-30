import React, {useState} from 'react';
import classes from "../styles/usersettingsmodal.module.css"
import { User } from '../../../Types/userTypes';
import ApiClient from '@/util/api';
import Cookies from 'js-cookie';
import { uploadCdnFile } from '@/util/functions';

interface UserSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
    user: User | undefined;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, setClose, user }) => {
    if (!user) return null;

    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user.lastName);
    const [location, setLocation] = useState(user?.location || '');
    const [status, setStatus] = useState(user?.status || '');
    const [avatarId, setAvatarId] = useState(user?.avatarId || '');
    const [skills, setSkills] = useState(user?.skills || []);

    const userAvatarFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>
        ) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const cdnResp = await uploadCdnFile(file);
            setAvatarId(cdnResp.r2file.id);
        }
    };
    

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // get token
        const token = Cookies.get('access_token');

        if (!token) {
            alert("You must be logged in to edit your profile.");
            return;
        }

        console.log(skills);

        await ApiClient.getInstance().editUser(
            firstName, 
            lastName,
            location,
            status,
            token,
            skills,
            avatarId,
        )
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>User Settings</h2>
                <form onSubmit={handleSubmit}>
                    <label>
                        First Name:
                        <input type="text" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </label>
                    <label>
                        Last Name:
                        <input type="text" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </label>
                    <label>
                        Location:
                        <input type="text" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </label>
                    <label>
                        Status:
                        <input type="text" name="status" value={status} onChange={(e) => setStatus(e.target.value)} />
                    </label>
                    <label>
                        Skills:
                        <div>
                            <div className={classes.skills}>
                            {skills.map((skill, index) => (
                                <div key={index} className={classes.skill}>
                                    {skill}
                                    <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== index))}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Enter a skill"
                                    id="newSkillInput"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('newSkillInput') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            setSkills([...skills, input.value.trim()]);
                                            input.value = '';
                                        }
                                    }}
                                >
                                    Add Skill
                                </button>
                            </div>
                        </div>
                    </label>
                    <label>
                        Avatar URL:
                        <input type="file" name="profileImage" onChange={userAvatarFileChange} />
                    </label>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default UserSettingsModal;