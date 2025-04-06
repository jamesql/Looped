import { User } from '../../../Types/userTypes';
import React, { useState, useRef } from "react";
import classes from "../styles/application.module.css";
import { MdAttachFile, MdSend } from "react-icons/md";
import { uploadCdnFile } from "@/util/functions";


interface DirectChannelProps {
    friend : User;
}

const DirectChannel: React.FC<DirectChannelProps> = ({ }) => {
    const [currentMessage, setCurrentMessage] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);
  
    const sendMessage = (fileId?: string): void => {
      if (currentMessage.trim() !== "" || fileId !== undefined) {
        console.log("Sending message:", currentMessage);
  
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

export default DirectChannel;