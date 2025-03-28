import classes from "../styles/application.module.css";
import React from "react";
import { Message } from "../../../Types/serverTypes";
import ApiClient from "@/util/api";
import Cookie from 'js-cookie';

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
    if (!message || !message.author) {
        return null;
    }
    if(message.file){
      const fileResp = await ApiClient.getInstance().getFileById(Cookie.get("access_token") || "", message.file.id);
      const file = fileResp.data.url;
    }
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
          if
          <p>{message.file?.fileName}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
