import React from 'react';
import { DirectChannel as DChannel, User } from '../../../Types/userTypes';

interface DirectChannelProps {
    friend : User;
}

const DirectChannel: React.FC<DirectChannelProps> = ({ friend }) => {
    return (
        <div>
            <h1>Direct Channel</h1>
            <p>{friend.firstName}</p>
        </div>
    );
};

export default DirectChannel;