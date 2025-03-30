import React from "react";
import { MdPersonAdd } from "react-icons/md";
import classes from "../styles/application.module.css";

interface RequestsIconNumberedProps {
  inviteCount?: number;
}

const RequestsIconNumbered: React.FC<RequestsIconNumberedProps> = ({
  inviteCount
}) => {
  return (
    <div className={classes.badge_icon_wrapper}>
      <MdPersonAdd className={classes.chat_bar_icon} />
      {inviteCount !== undefined && inviteCount > 0 && (
        <span className={classes.notification_badge}>{inviteCount}</span>
      )}
    </div>
  );
};

export default RequestsIconNumbered;
