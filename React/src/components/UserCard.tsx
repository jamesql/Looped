import { User } from "../../../Types/userTypes";
import React from 'react';
import classes from "../styles/application.module.css"

interface UserCardProps {
    user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
    return (
        <div className={classes.usercard}>
            <img src={user.avatar} alt="User Avatar" className={classes.useravatar} />
            <div className={classes.username}>{user.}</div>
        </div>
    );
};
