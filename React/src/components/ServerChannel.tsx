import React, { useState, useRef } from "react";
import { User } from "../../../Types/userTypes";
import { Channel, Server } from "../../../Types/serverTypes";
import Cookies from "js-cookie";
import ApiClient from "@/util/api";
import classes from "../styles/application.module.css";
import { ContentCreateResponse } from "../../../Types/contentTypes";
import MessageComponent from "./MessageComponent";
import { MdAttachFile, MdSend } from "react-icons/md";
import { uploadCdnFile } from "@/util/functions";

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
