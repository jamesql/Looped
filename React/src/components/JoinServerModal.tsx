import React from 'react';
import classes from "../styles/joinmodal.module.css"
import ApiClient from '@/util/api';
import Cookie from 'js-cookie';

interface JoinServerModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
}

const JoinServerModal: React.FC<JoinServerModalProps> = ({ isOpen,  setClose}) => {
    const [serverId, setServerId] = React.useState('');

    const handleJoin = async () => {
        console.log(serverId);

        await ApiClient.getInstance().joinServer(
            serverId,
            Cookie.get("access_token") || ""
        ).then((response) => {
            console.log(response);
        });

        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Join Server</h2>
                <label>
                    Enter Server code 
                <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Enter server invite code"
                />
                </label>
                <span className={classes.button} onClick={() => handleJoin()}>Join</span>
            </div>
        </div>
    );
};

export default JoinServerModal;