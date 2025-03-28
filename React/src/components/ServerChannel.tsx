import React, { useState, useRef } from "react";
import { User } from "../../../Types/userTypes";
import { Channel, Server } from "../../../Types/serverTypes";
import Cookies from "js-cookie";
import ApiClient from "@/util/api";
import classes from "../styles/application.module.css";
import { ContentCreateResponse } from "../../../Types/contentTypes";
import MessageComponent from "./MessageComponent";
import { MdAttachFile, MdSend } from "react-icons/md";

interface ServerChannelProps {
  selectedServer: Server;
  selectedChannel: Channel;
}

const ServerChannel: React.FC<ServerChannelProps> = ({
  selectedServer,
  selectedChannel,
}) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const sendMessage = (fileId?: string): void => {
    if (currentMessage.trim() !== "" || fileId !== undefined) {
      console.log("Sending message:", currentMessage);
      ApiClient.getInstance()
        .createMessage(
          selectedChannel?.id || "",
          currentMessage,
          Cookies.get("access_token") || "",
          fileId
        )
        .then((response) => {
          console.log(response);
        });

      setCurrentMessage("");
      // clear input box with class message_input
      (
        document.querySelector("." + classes.message_input) as HTMLInputElement
      ).value = "";
    }
  };

  // File uploading
  const handleFileButtonClick = () => {
    fileInput?.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles: File[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" is too large (max 5MB).`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      try {
        for (const file of validFiles) {
          console.log(file.type);
          const response = await ApiClient.getInstance().generateFileUrl(
            Cookies.get("access_token") || "",
            file.name,
            file.type
          );

          const resp = response.data as ContentCreateResponse;

          const presignedUrl = resp.url;
          console.log(`Uploading ${file.name} to R2 via:`, presignedUrl);

          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            console.error(
              `Upload failed for ${file.name}:`,
              await uploadResponse.text()
            );
          } else {
            console.log(`Upload successful for ${file.name}, id`);
            sendMessage(resp.r2file.id); // send message with fileId
          }
        }
      } catch (error) {
        console.error("Error uploading to R2:", error);
      }
    }
  };

  return (
    <>
      <div className={classes.messages}>
        {[...(selectedChannel?.messages || [])].reverse().map((message) => (
          <MessageComponent message={message} />
        ))}
      </div>

      <div className={classes.chat_input}>
        <button
          className={classes.chat_bar_button}
          onClick={handleFileButtonClick}
        >
          <MdAttachFile className={classes.chat_bar_icon} />
        </button>
        <input
          type="file"
          ref={fileInput}
          onChange={handleFileChange}
          style={{ display: "none" }}
        ></input>
        <input
          className={classes.message_input}
          onChange={(e) => setCurrentMessage(e.target.value)}
          type="text"
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          className={classes.chat_bar_button}
          onClick={() => sendMessage()}
        >
          <MdSend className={classes.chat_bar_icon} />
        </button>
      </div>
    </>
  );
};

export default ServerChannel;
