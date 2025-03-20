import classes from "../styles/application.module.css";
import React from "react";
import { Message } from "../../../Types/serverTypes";

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  return (
    <div className={classes.message}>
      <img className={classes.squircle} src={message.author.avatar?message.author.avatar:"/logo_main.jpg"} alt="" />
      <div className={classes.message_details}>
        <div className={classes.author_details}>
          <h3>
            {message.author.firstName} {message.author.lastName}
          </h3>
          <p>{new Date(message.createdAt).toLocaleString()}</p>
        </div>

        <div className={classes.message_content}>
          <p>{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
