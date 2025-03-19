import { User } from "../../../Types/userTypes";
import React from 'react';
import classes from "../styles/application.module.css"

interface UserCardProps {
    user: User;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
    return (
        <li className={classes.member_card}>
        <div className={classes.member_image}>
            <img className={classes.squircle} src={user.avatar} alt="" />
        </div>
        <div className={classes.member_info}>
            <h3>{user.firstName} {user.lastName}</h3>
            <h4>{user.bio}</h4>
        </div>
    </li>
    );
};

export default UserCard;
