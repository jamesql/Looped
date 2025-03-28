import classes from "../styles/application.module.css";
import React, { useState, useEffect } from "react";
import { Message } from "../../../Types/serverTypes";
import ApiClient from "@/util/api";
import Cookie from "js-cookie";
import { MdDownload } from "react-icons/md";

interface MessageComponentProps {
  message: Message;
}

const supportedImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const MessageComponent: React.FC<MessageComponentProps> = ({ message }) => {
  const [fileUrl, setFileUrl] = useState<string>();

  useEffect(() => {
    const fetchFileUrl = async () => {
      if (!message.file) return;

      try {
        const token = Cookie.get("access_token") ?? "";
        const fileResp = await ApiClient.getInstance().getFileById(token, message.file.id);

        if (fileResp.status === 200) {
          setFileUrl(fileResp.data.url);
        }
      } catch (error) {
        console.error("Error fetching file URL:", error);
      }
    };

    fetchFileUrl();
  }, [message.file]);

  if (!message?.author) return null;

  const renderFilePreview = () => {
    const file = message.file;
    if (!file || !fileUrl) return null;

    const fileName = file.fileName ?? "File";

    if (supportedImageTypes.has(file.contentType)) {
      return (
        <div className={classes.message_image_container}>
          <img
            className={classes.message_image}
            src={fileUrl}
            alt={fileName}
          />
          <div className={classes.message_image_caption}>{fileName}</div>
        </div>
      );
    }

    if (file.contentType === "video/mp4") {
      return (
        <div className={classes.message_image_container}>
          <video className={classes.message_image} controls src={fileUrl}>
            Your browser does not support the video tag.
          </video>
          <div className={classes.message_image_caption}>{fileName}</div>
        </div>
      );
    }

    return (
      <a href={fileUrl} download={fileName}  target="_blank" rel="noopener noreferrer">
        <div className={classes.message_attachment_box}>
          <MdDownload className={classes.message_attachment_icon} />
          <div>{fileName}</div>
        </div>
      </a>
    );
  };

  return (
    <div className={classes.message}>
      <img
        className={classes.squircle}
        src={message.author.avatar ? message.author.avatar : "/logo_main.jpg"}
        alt=""
      />


      <div className={classes.message_details}>
        <div className={classes.author_details}>
          <h3>{`${message.author.firstName} ${message.author.lastName}`}</h3>
          <p>{new Date(message.createdAt).toLocaleString()}</p>
        </div>

        <div className={classes.message_content}>
          <p>{message.content}</p>
          {renderFilePreview()}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;
