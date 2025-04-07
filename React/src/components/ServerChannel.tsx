import React, { useState, useRef } from "react";
import { Channel, Server } from "../../../Types/serverTypes";
import Cookies from "js-cookie";
import ApiClient from "@/util/api";
import classes from "../styles/application.module.css";
import MessageComponent from "./MessageComponent";
import { MdAttachFile, MdSend } from "react-icons/md";
import { uploadCdnFile } from "@/util/functions";
import { User } from "../../../Types/userTypes";

interface ServerChannelProps {
  selectedChannel: Channel;
  session: User | null | undefined; // Session user for context
  selectedServer?: Server; // Optional prop for selected server
  handleProfileCard?: (e: React.MouseEvent, u: User) => void; // Optional prop for handling profile card click
}

const ServerChannel: React.FC<ServerChannelProps> = ({
  selectedChannel,
  handleProfileCard,
  session,
  selectedServer
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
      for(let i = 0; i < files.length; i++) {
        const file = files[i];
        const cdnResp = await uploadCdnFile(file);
        sendMessage(cdnResp.r2file.id);
      }
    }
  };

  return (
    <>
      <div className={classes.messages}>
        {[...(selectedChannel?.messages || [])].reverse().map((message) => (
          <MessageComponent key={message.id} message={message} handleProfileCard={handleProfileCard} session={session} selectedServer={selectedServer}/>
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
          multiple
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
