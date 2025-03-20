import React from 'react';
import classes from "../styles/usersettingsmodal.module.css"

interface UserSettingsModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen,  setClose}) => {
    const [serverId, setServerId] = React.useState('');

    const handleSubmit = (e: any) => {
        console.log(serverId);
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>User Settings</h2>
                <button onClick={(e) => handleSubmit(e)}>Save Changes</button>
            </div>
        </div>
    );
};

export default UserSettingsModal;