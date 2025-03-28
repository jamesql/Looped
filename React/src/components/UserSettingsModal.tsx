import React, {useState} from 'react';
import classes from "../styles/usersettingsmodal.module.css"
import { User } from '../../../Types/userTypes';
import ApiClient from '@/util/api';
import Cookies from 'js-cookie';

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
    const [profileImage, setProfileImage] = useState(user?.avatar || '');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        // get token
        const token = Cookies.get('access_token');

        if (!token) {
            alert("You must be logged in to edit your profile.");
            return;
        }

        await ApiClient.getInstance().editUser(
            firstName, 
            lastName,
            location,
            status,
            profileImage,
            token
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
                        Avatar URL:
                        <input type="text" name="profileImage" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
                    </label>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
};

export default UserSettingsModal;