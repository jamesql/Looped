import React, { useEffect, useState } from "react";
import { User } from "../../../Types/userTypes";
import UserProfileModal from "./UserProfileModal";
import UserCard from "./UserCard";
import { Server } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";

interface MembersListProps {
  session?: User | null;
  selectedServer?: Server | null;
  handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const MembersList: React.FC<MembersListProps> = ({
  session,
  selectedServer,
  handleProfileCard
}) => {
  return (
    <>
      <ul className={classes.members_list}>
        {selectedServer?.members?.map((member) => (
          <UserCard
            user={member}
            isAdmin={session?.id === selectedServer?.ownerId}
            isSelf={session?.id === member.id} // Check if the user is the same as the session user
            isFriend={
              session?.friends
                ? session?.friends?.some((u) => u.id === member.id)
                : false
            }
            incomingRequest={
              session?.friendRequestsReceived
                ? session?.friendRequestsReceived.some(
                    (request) => request.id === member.id
                  )
                : false
            } // Check if the user has sent a friend request to this member
            outgoingRequest={
              session?.friendRequestsSent
                ? session?.friendRequestsSent.some(
                    (request) => request.id === member.id
                  )
                : false
            } // Check if this member has sent a friend request to the user
            handleProfileCard={handleProfileCard}
          />
        ))}
      </ul>
    </>
  );
};

export default MembersList;
