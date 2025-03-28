import React, { useEffect, useRef, useState } from "react";
import LoopedSession from "../../../Types/sessionTypes";
import { Channel, Server, Role } from "../../../Types/serverTypes";
import { User } from "../../../Types/userTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";
import classes from "../styles/application.module.css";
import ServerInfo from "@/components/ServerInfo";
import FriendsList from "@/components/FriendsList";
import { Permissions } from "../../../Types/permissionsTypes";
import ServerIcon from "@/components/ServerIcon";
import { checkPermissions } from "@/util/functions";
import UserCard from "@/components/UserCard";

const ApplicationNew: React.FC = () => {
  // data states
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<LoopedSession | null>(null);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  // modal states
  const [serverSettings, setServerSettings] = useState(false);
  const [createChannel, setCreateChannel] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [joiningServer, setJoiningServer] = useState(false);
  const [userSettings, setUserSettings] = useState(false);

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

  useEffect(() => {
    // change back
    if (authed) {
      setLoading(false);
    }
  }, [authed, session]);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div>
          <div className={classes.container}>
            <div className={classes.server_info}>
              {!selectedServer ? (
                <div className={classes.server_card}>
                  <div className={classes.server_card_info}>
                    <h1>Direct Messages</h1>
                  </div>
                </div>
              ) : (
                <div className={classes.server_card}>
                  <ServerInfo selectedServer={selectedServer} />

                  {session?.id === selectedServer?.ownerId && (
                    <button
                      className={classes.settings_icon}
                      onClick={() => setServerSettings(true)}
                    >
                      <img src="/settings.svg" alt="Settings" />
                    </button>
                  )}
                </div>
              )}

              {!selectedServer ? (
                <FriendsList friends={[]} />
              ) : (
                <div className={classes.channel_list}>
                  {(selectedServer.ownerId === session?.id ||
                    checkPermissions(
                      selectedServer.id,
                      session?.roles ? session.roles : [],
                      Permissions.ADMIN
                    )) && (
                    <div
                      className={[classes.channel, classes.channel_create].join(
                        " "
                      )}
                      onClick={() => setCreateChannel(true)}
                    >
                      +
                    </div>
                  )}

                  {selectedServer?.channels
                    ? selectedServer.channels.map((channel) => (
                        <div
                          className={[
                            classes.channel,
                            selectedChannel?.id === channel.id
                              ? classes.channel_active
                              : "",
                          ].join(" ")}
                          onClick={() => setSelectedChannel(channel)}
                        >
                          <h2 className={classes.channel_name}>
                            # {channel.name.toLowerCase().split(" ").join("-")}
                          </h2>
                        </div>
                      ))
                    : ""}
                </div>
              )}
            </div>

            <div className={classes.application}>
              <div className={classes.server_nav}>
                <ul className={classes.server_container}>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => {
                      setSelectedServer(null);
                      setSelectedChannel(null);
                      setSelectedFriend(null);
                    }}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Home</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => setJoiningServer(true)}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Join Server</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>
                  <li
                    className={[classes.squircle, classes.server_icon].join(
                      " "
                    )}
                    onClick={() => setCreatingServer(true)}
                  >
                    <div className={classes.popper}>
                      <h4 className={classes.popped}>Create Server</h4>
                    </div>
                  </li>
                  <li className={classes.divider}></li>

                  {session?.servers?.map((s) => (
                    <ServerIcon
                      server={s}
                      setSelectedServer={setSelectedServer}
                      setSelectedChannel={setSelectedChannel}
                      selectedServer={selectedServer}
                      selectedChannel={selectedChannel}
                    />
                  ))}
                </ul>
              </div>

                {/** Server Discovery  */}

                {/** Friend DM Channel  */}

                {/** Server Channel */}



            </div>

            <div className={classes.members_profile}>

            <ul className={classes.members_list}>
                {selectedServer?.members?selectedServer?.members.map((member) => (
                  <UserCard user={member} is_admin={session?.id === selectedServer?.ownerId} /> // TODO: improve perm checking here.
                )):("")}
            </ul>

            <div className={classes.profile_card}>
                <div className={classes.profile_member}>
                  <div className={classes.member_image}>
                    <img
                      className={classes.squircle}
                      src={session?.avatar?session.avatar:"/logo_main.jpg"}
                      alt=""
                    />
                  </div>
                  <div className={classes.member_info}>
                    <h3>
                      {session?.firstName} {session?.lastName}
                    </h3>
                    <h4>{session?.status}</h4>
                  </div>
                </div>
                <button className={classes.settings_icon} onClick={() => setUserSettings(true)}>
                  <img src="/settings.svg" alt="" />
                </button>
              </div>
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationNew;
