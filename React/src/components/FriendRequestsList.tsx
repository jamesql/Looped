import React, { useState } from "react";
import { User } from "../../../Types/userTypes";
import FriendRequestCard from "./FriendRequestCard";
import classes from "../styles/application.module.css";

interface FriendsListProps {
  friends?: User[];
}

const FriendRequestsList: React.FC<FriendsListProps> = ({ friends = [] }) => {
  const [friendList, setFriendList] = useState<User[]>(friends);

  const removeUserFromList = (user: User) => {
    setFriendList((prevList) => prevList.filter((friend) => friend.id !== user.id));
  };

  return (
    <div className={classes.friend_requests_container}>
      <h1>Friend Requests</h1>
      {friendList.map((friend) => (
        <FriendRequestCard key={friend.id} user={friend} onAction={removeUserFromList} />
      ))}
    </div>
  );
};

export default FriendRequestsList;
