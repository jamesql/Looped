import classes from "../styles/application.module.css";
import React, { useState, useEffect, useRef } from "react";
import { Message } from "../../../Types/serverTypes";
import { MdDownload } from "react-icons/md";
import prettyBytes from 'pretty-bytes';
import { getCdnFileUrl } from "@/util/functions";
import { User } from "../../../Types/userTypes";
import { createPortal } from "react-dom";

interface MessageComponentProps {
  message: Message;
  handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const supportedImageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

const MessageComponent: React.FC<MessageComponentProps> = ({ message, handleProfileCard }) => {
  const [fileUrl, setFileUrl] = useState<string>();
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string>("/logo_main.jpg");
  const [isImageZoomed, setIsImageZoomed] = useState<boolean>(false);

  const truncateFileName = (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.slice(fileName.lastIndexOf('.'));
    const baseName = fileName.slice(0, maxLength - extension.length - 3); // Reserve space for "..."
    return `${baseName}...${extension}`;
  };

  useEffect(() => {
    if(message.file)
      getCdnFileUrl(message.file).then(url => {
        setFileUrl(url);
      });
  }, [message.file]);

  useEffect(() => { 
    const fetchAvatarUrl = async () => {
      if (message.author?.avatar) {
        const url = await getCdnFileUrl(message.author.avatar);
        setAuthorAvatarUrl(url);
      }
    };
    fetchAvatarUrl();
  }, [message.author?.avatar]);

  const handleImageClick = () => {
    setIsImageZoomed(true);
  };

  const closeImageZoom = () => {
    setIsImageZoomed(false);
  };

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
            onClick={handleImageClick}
          />
          <div className={classes.message_image_caption}>{truncateFileName(fileName)}</div>
        </div>
      );
    }

    if (file.contentType === "video/mp4") {
      return (
        <div className={classes.message_image_container}>
          <video className={classes.message_image} controls src={fileUrl}>
            Your browser does not support the video tag.
          </video>
          <div className={classes.message_image_caption}>{truncateFileName(fileName)}</div>
        </div>
      );
    }

    return (
      <a href={fileUrl} download={fileName}  target="_blank" rel="noopener noreferrer">
        <div className={classes.message_attachment_box}>
          <div className={classes.message_attachment_row}>
            {truncateFileName(fileName)}
            <MdDownload className={classes.message_attachment_icon} />
          </div>
          {prettyBytes(file.fileSize)}
        </div>
      </a>
    );
  };


  return (
    <>
      <div className={classes.message}>
        <img
          className={classes.squircle}
          src={authorAvatarUrl}
          alt=""
          onClick={(e) => {
            if (handleProfileCard && message.author) {
              handleProfileCard(e, message.author); // Call the function if provided
            }
          }}
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

      {isImageZoomed &&
        createPortal(
          <div
            className={classes.image_zoom_overlay}
            onClick={closeImageZoom}
          >
            <img
              className={classes.image_zoom}
              src={fileUrl}
              alt="Zoomed"
            />
          </div>,
          document.body
        )}
    </>
  );
};

export default MessageComponent;
