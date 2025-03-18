import React, { useEffect, useState } from "react";
import WebSocketComponent from "@/components/WebSocket";
import { OpCodeHandler } from "@/util/ws";
import { OPCodes } from "../../../Types/socketTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";

const Application: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  // create the map of listeners
  const listeners = new Map<number, OpCodeHandler[]>();

  // check if access and refresh token are in cookie
  useEffect(() => {
    const accessToken = Cookies.get("access_token");
    const refreshToken = Cookies.get("refresh_token");

    if (!accessToken || !refreshToken) {
      // redirect to login page
      window.location.href = "/login";
    } else {
      setAuthed(true);
      // here we also want to add some api client logic
      // to validate token and then try and refresh before sending back to login
    }
  }, []);

  // done loading after accessToken, refreshToken and authed is true
  useEffect(() => {
    if (authed) {
      setLoading(false);
    }
  }, [authed]);

  // Example handler
  const exampleHandler: OpCodeHandler = (data) => {
    console.log("Received data:", data);
  };
  listeners.set(OPCodes.HELLO, [exampleHandler]);

  return loading ? (
    <div>
      <Loader />
    </div>
  ) : (
    <div>
      <WebSocketComponent url={"ws://127.0.0.1:444"} listeners={listeners} />
      <div className={classes.container}>
        <div className={classes.server_info}>
          <div className={classes.server_card}>
            <div className={classes.server_card_info}>
              <h1>Meta Recruitment</h1>
              <a href="https://meta.com">https://meta.com</a>
            </div>

            <button className={classes.settings_icon}>
              <img src="/settings.svg" alt="" />
            </button>
          </div>

          <div className={classes.channel_list}>
            <div
              className={[classes.channel, classes.channel_active].join(" ")}
            >
              <h2 className={classes.channel_name}># general</h2>
            </div>

            <div className={[classes.channel].join(" ")}>
              <h2 className={classes.channel_name}># random</h2>
            </div>
          </div>
      </div>

      <div className={classes.application}>
              <div className={classes.server_nav}>
                <ul className={classes.server_container}>
                  <li className={classes.divider}></li>
                  <li className={[classes.squircle, classes.server_icon].join(" ")}>
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>
                        Server Name
                      </h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li className={[classes.squircle, classes.server_icon, classes.server_icon_active].join(" ")}>
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>
                        Active Server
                      </h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>

                </ul>
              </div>

              <div className={classes.messages}>

                <div className={classes.message}>

                </div>

                <div className={classes.chat_input}>
                    <button className={classes.attach_button}>
                      <img src="/paperclip.svg" alt="Add File" />
                    </button>
                    <input className={classes.message_input} type="text" placeholder="Type a message..." />
                    <button className={classes.send_button}>
                      <img src="/send.svg" alt="Send Message" />
                    </button>
                </div>

              </div>



        </div>


        <div className={classes.members_profile}>

        </div>
      </div>
    </div>

  );
};

export default Application;
