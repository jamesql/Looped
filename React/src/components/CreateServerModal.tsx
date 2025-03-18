import React from 'react';
import classes from "../styles/createservermodal.module.css"

interface CreateServerModalProps {
    isOpen: boolean;
    setClose: (arg0: boolean) => void;
}

const CreareServerModal: React.FC<CreateServerModalProps> = ({ isOpen,  setClose}) => {
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
                <h2>Create Server</h2>
                <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Enter server invite code"
                />
                <button onClick={(e) => handleJoin(e)}>Create</button>
            </div>
        </div>
    );
};

export default CreareServerModal;