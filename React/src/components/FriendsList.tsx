import React from "react";
import { User } from "../../../Types/userTypes";
import FriendCard from "./FriendCard";

interface FriendsListProps {
  friends: User[];
  clickFunc?: (u: User) => void;
  activeUser? : User | null;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, clickFunc, activeUser }) => {
  return (
    <>
      {friends.map((friend) => (
          <FriendCard user={friend} clickFunc={clickFunc} active={activeUser?.id == friend.id} />
      ))}
    </>
  );
};

export default FriendsList;
