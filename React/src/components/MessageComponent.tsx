import classes from "../styles/application.module.css";
import React, { useState, useEffect } from "react";
import { Message } from "../../../Types/serverTypes";
import ApiClient from "@/util/api";
import Cookie from "js-cookie";

interface MessageComponentProps {
  message: Message;
}

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  if (!message || !message.author) {
    return null;
  }

  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (message.file) {
      const fetchFileUrl = async () => {
        try {
          const fileResp = await ApiClient.getInstance().getFileById(
            Cookie.get("access_token") || "",
            message.file?.id || ""
          );
          if (fileResp.status === 200) {
            setFileUrl(fileResp.data.url);
          }
        } catch (error) {
          console.error("Error fetching file URL:", error);
        }
      };

      fetchFileUrl();
    }
    else {
      setFileUrl(undefined);
    }
  }, [message.file]);

  return (
    <div className={classes.message}>
      <img
        className={classes.squircle}
        src={message.author.avatar ? message.author.avatar : "/logo_main.jpg"}
        alt=""
      />
      <div className={classes.message_details}>
        <div className={classes.author_details}>
          <h3>
            {message.author.firstName} {message.author.lastName}
          </h3>
          <p>{new Date(message.createdAt).toLocaleString()}</p>
        </div>

        <div className={classes.message_content}>
          <p>{message.content}</p>
          {fileUrl && (
            <div className={classes.file_attachment}>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                {message.file?.fileName || "Download File"}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;