import React from "react";
import { User } from "../../../Types/userTypes";
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
            key={member.id}
            user={member}
            selectedServer={selectedServer}
            session={session}
            handleProfileCard={handleProfileCard}
          />
        ))}
      </ul>
    </>
  );
};

export default MembersList;
