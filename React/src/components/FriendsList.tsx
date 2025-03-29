import React from "react";
import { User } from "../../../Types/userTypes";
import FriendCard from "./FriendCard";

interface FriendsListProps {
  friends: User[];
}

const FriendsList: React.FC<FriendsListProps> = ({ friends }) => {
  return (
    <>
      {friends.map((friend) => (
        <FriendCard user={friend} />
      ))}
    </>
  );
};

export default FriendsList;
