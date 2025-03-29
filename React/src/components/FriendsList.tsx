import React from "react";
import { User } from "../../../Types/userTypes";
import FriendCard from "./FriendCard";

interface FriendsListProps {
  friends: User[];
  clickFunc?: (u: User) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, clickFunc }) => {
  return (
    <>
      {friends.map((friend) => (
        <FriendCard user={friend} clickFunc={clickFunc} />
      ))}
    </>
  );
};

export default FriendsList;
