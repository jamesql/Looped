import React from "react";
import { User } from "../../../Types/userTypes";
import FriendCard from "./FriendCard";

interface FriendsListProps {
  friends: User[];
  clickFunc?: (u: User) => void;
  activeUser?: User | null;
  handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const FriendsList: React.FC<FriendsListProps> = ({
  friends,
  clickFunc,
  activeUser,
  handleProfileCard
}) => {

  return (
    <>
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          user={friend}
          clickFunc={clickFunc}
          active={activeUser?.id == friend.id}
          handleProfileCard={handleProfileCard}
        />
      ))}
      
    </>
  );
};

export default FriendsList;
