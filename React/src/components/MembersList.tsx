import React, { useEffect, useState } from "react";
import { User } from "../../../Types/userTypes";
import UserProfileModal from "./UserProfileModal";
import UserCard from "./UserCard";
import { Server } from "../../../Types/serverTypes";
import classes from "../styles/application.module.css";

interface MembersListProps {
  session?: User | null;
  selectedServer?: Server | null;
}

const MembersList: React.FC<MembersListProps> = ({
  session,
  selectedServer,
}) => {
  const [cardVisible, setCardVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [cardUser, setCardUser] = useState<User | null>(null);
  const handleProfileCard = (e: React.MouseEvent, u: User) => {
    e.stopPropagation(); // Stop the event from bubbling up to the document
    e.preventDefault(); // Prevent the default click

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 250; // Approximate width of the dropdown
    const dropdownHeight = 500; // Approximate height of the dropdown

    let x = e.pageX;
    let y = e.pageY;

    if (x + dropdownWidth > viewportWidth) {
      x = viewportWidth - dropdownWidth - 10; // Add some padding
    }
    if (y + dropdownHeight > viewportHeight) {
      y = viewportHeight - dropdownHeight - 10; // Add some padding
    }
    setCardPosition({ x, y });
    setCardUser(u);
    setCardVisible(true);
  };

  const handleClickOutsideCard = () => {
    setCardVisible(false);
  };

  useEffect(() => {
    if (cardVisible) {
      document.addEventListener("click", handleClickOutsideCard);
    } else {
      document.removeEventListener("click", handleClickOutsideCard);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideCard);
    };
  }, [cardVisible]);

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
      {/* Profile Card */}
      {cardVisible && (
        <UserProfileModal
          user={cardUser}
          x={cardPosition.x}
          y={cardPosition.y}
        ></UserProfileModal>
      )}
    </>
  );
};

export default MembersList;
