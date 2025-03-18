import React from 'react';
import classes from "../styles/joinmodal.module.css"

interface JoinServerModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
}

const JoinServerModal: React.FC<JoinServerModalProps> = ({ isOpen,  setClose}) => {
    const [serverId, setServerId] = React.useState('');

    const handleJoin = (e: any) => {
        console.log(serverId);
        setClose(false);
    };

    if (!isOpen) return null;

    return (
        <div className={classes.modal}>
            <div className={classes.modal_content}>
                <span className={classes.close} onClick={() => setClose(false)}>&times;</span>
                <h2>Join Server</h2>
                <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Enter server invite code"
                />
                <button onClick={(e) => handleJoin(e)}>Join</button>
            </div>
        </div>
    );
};

export default JoinServerModal;