import React, { useEffect, useState } from "react";
import WebSocketComponent from "@/components/WebSocket";
import { OpCodeHandler, WebSocketClient } from "@/util/ws";
import { OPCodes } from "../../../Types/socketTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";
import LoopedSession from "../../../Types/sessionTypes";
import { Channel, Server } from "../../../Types/serverTypes";
import JoinServerModal from "@/components/JoinServerModal";
import CreareServerModal from "@/components/CreateServerModal";
import FriendsModal from "@/components/FriendsModal";

const Application: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<LoopedSession | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [joiningServer, setJoiningServer] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [friendsPage, setFriendsPage] = useState(false);
  

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
    if (authed && session) {
      setLoading(false);
    }
  }, [authed, session]);

  // Example handler
  const helloHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Received data:", data);

    if (!Cookies.get("access_token")) {
      console.log("No access token found, redirecting to login");
      window.location.href = "/login";
      return;
    }

    client.send({
      op: OPCodes.AUTH,
      d: {
        access_token: Cookies.get("access_token"),
      },
    });
  };

  const readyHandler: OpCodeHandler = (data: any, client: WebSocketClient) => {
    console.log("Ready data:", data);

    setSession(data._session);
  };

  listeners.set(OPCodes.HELLO, [helloHandler]);
  listeners.set(OPCodes.READY, [readyHandler]);

  return (
    <div>
      <WebSocketComponent url={"ws://127.0.0.1:444"} listeners={listeners} />

      {joiningServer && (
        <JoinServerModal isOpen={true} setClose={setJoiningServer} />
      )}

      {creatingServer && (
        <CreareServerModal isOpen={true} setClose={setCreatingServer} />
      )}

      {friendsPage && (
        <FriendsModal isOpen={true} setClose={setFriendsPage} />
      )}

      {loading ? (
        <Loader />
      ) : (
        <div>
      <div className={classes.container}>
        <div className={classes.server_info}>
          <div className={classes.server_card}>
            <div className={classes.server_card_info}>
              <h1>{selectedServer?selectedServer.name:"No Server Selected"}</h1>
              <a href="https://meta.com">https://meta.com</a>
            </div>

            {session?.user.id === selectedServer?.ownerId && (
              <button className={classes.settings_icon}>
              <img src="/settings.svg" alt="Settings" />
              </button>
            )}
          </div>

          <div className={classes.channel_list}>

            {selectedServer?.channels.map((channel) => (
                <div className={[classes.channel, (selectedChannel?.id===channel.id)?classes.channel_active:""].join(" ")}>
                  <h2 className={classes.channel_name}># {channel.name}</h2>
                </div>
            ))}

          </div>
      </div>

      <div className={classes.application}>
              <div className={classes.server_nav}>
                <ul className={classes.server_container}>
                <li className={classes.divider}></li>
                  <li className={[classes.squircle, classes.server_icon].join(" ")} onClick={() => setFriendsPage(true)}>
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>
                        Friends
                      </h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li className={[classes.squircle, classes.server_icon].join(" ")} onClick={() => setJoiningServer(true)}>
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>
                        Join Server
                      </h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li className={[classes.squircle, classes.server_icon].join(" ")} onClick={() => setCreatingServer(true)}>
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>
                        Create Server
                      </h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>

                  { session?.servers.map((s => (<>
                    <li key={s.id} className={[classes.squircle, classes.server_icon, s.id===selectedServer?.id?classes.server_icon_active:""].join(" ")} onClick={() => setSelectedServer(s)}>
                      <div className={classes.popper}>
                        <h4 className={classes.popped}>
                          {s.name}
                        </h4>
                      </div>
                    </li>
                    <li className={classes.divider}></li>
                    </>
                  ))) }

                </ul>
              </div>

              <div className={classes.messages}>

                <div className={classes.message}>
                  <img className={classes.squircle} src="https://as1.ftcdn.net/v2/jpg/05/56/29/36/1000_F_556293653_e9P80XtK4yyDd8WU1vRtdqSU1Vym7zoX.jpg" alt="" />
                  <div className={classes.message_details}>
                    <div className={classes.author_details}>
                        <h3>James Ash</h3>
                        <p>03/14/2025 - 11:15 AM</p>
                    </div>

                    <div className={classes.message_content}>
                        <p>
                        Hello, this is a test message to see how the chat looks like. Hello, this is a test message to see how the chat looks like. Hello, this is a test message to see how the chat looks like. Hello, this is a test message to see how the chat looks like.
                        </p>
                    </div>

                  </div>  
                </div>
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


        <div className={classes.members_profile}>
            <ul className={classes.members_list}>
              <li className={classes.member_card}>
                  <div className={classes.member_image}>
                      <img className={classes.squircle} src="https://as1.ftcdn.net/v2/jpg/05/56/29/36/1000_F_556293653_e9P80XtK4yyDd8WU1vRtdqSU1Vym7zoX.jpg" alt="" />
                  </div>
                  <div className={classes.member_info}>
                      <h3>James Ash</h3>
                      <h4>Software Engineer @ Meta</h4>
                  </div>
              </li>
            </ul>
            <div className={classes.profile_card}>
              <div className={classes.profile_member}>
                <div className={classes.member_image}>
                  <img className={classes.squircle} src="https://as1.ftcdn.net/v2/jpg/05/56/29/36/1000_F_556293653_e9P80XtK4yyDd8WU1vRtdqSU1Vym7zoX.jpg" alt="" />
                </div>
                <div className={classes.member_info}>
                  <h3>{session?.user.firstName} {session?.user.lastName}</h3>
                  <h4>Software Engineer @ Meta</h4>
                </div>
              </div>
              <button className={classes.settings_icon}>
                <img src="/settings.svg" alt="" />
              </button>
            </div>
        </div>
      </div>
    </div>
      )}
    </div>
  )
};

export default Application;
