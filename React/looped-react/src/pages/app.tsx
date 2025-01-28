import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import APIClient from "./api/APIClient";
import { WebSocketComponent } from "./components/_ws";
import { Server, Channel } from "./ws/WSValues";

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [serverData, setServerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedServerData, setSelectedServerData] = useState(null);
  const [isServerOwner, setIsServerOwner] = useState(false);
  const [creatingServer, setCreatingServer] = useState(false);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newChannelData, setNewChannelData] = useState({
    name: "",
    type: "TEXT",
  });

  // get token
  useEffect(() => {
    const fetchedToken = Cookie.get("accessToken");
    const fetchedUserId = Cookie.get("userId");

    if (!fetchedToken) window.location.href = "http://localhost:3000";
    else setToken(fetchedToken);

    setUserId(fetchedUserId);
  }, []);

  // get server data
  useEffect(() => {
    if (!token) return;

    const getData = async () => {
      const data = await APIClient.getServerData(token);
      setServerData(data);
      setLoading(false);
    };

    getData();
  }, [token, userId]);

  // update selected server data if serverData changes
  useEffect(() => {
    if (!selectedServer) return;

    setSelectedServerData(
        serverData.find((s) => s.id === selectedServer)
    );

  }, [serverData]);

  const handleHello = async () => {};

  const handleReady = async () => {};

  const handleCreateServer = (newServer: Server) => {
    setServerData((prevState) => {
      const newState = [...prevState, newServer];
      return newState;
    });
    setIsServerOwner(newServer.ownerId === userId);
  
    // Automatically select the newly created server
    handleServerSelect(newServer.id);
  };

  // Handle server selection
  const handleServerSelect = (serverId) => {
    const server = serverData.find((server) => server.id === serverId);
    setSelectedServer(serverId);
    setSelectedChannel(null); // Reset channel selection when server changes

    if (server) {
      setSelectedServerData(server);
      setIsServerOwner(server.ownerId === userId); // Update isServerOwner based on selected server
    }
  };

  // Handle channel selection
  const handleChannelSelect = (channelId) => {
    setSelectedChannel(channelId);
  };

  // Handle new channel
  const handleCreateChannel = (newChannel: Channel) => {
    console.log('Received new channel:', newChannel);
    setServerData(prevState => 
      prevState.map(server => {
        if (server.id === newChannel.serverid) {
          return {
            ...server,
            Channel: [...server.Channel, newChannel],
          };
        }
        return server;
      })
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <WebSocketComponent
        onHelloCallback={handleHello}
        onReadyCallback={handleReady}
        onServerCreateCallback={handleCreateServer}
        onCreateChannelCallback={handleCreateChannel}
      />
      {/* WebSocket component */}
      <h1>Welcome to Looped.</h1>
      <h2>User ID: {userId}</h2>

      {/* Server selection dropdown */}
      <div>
        <label htmlFor="serverSelect">Select Server:</label>
        <select
          id="serverSelect"
          onChange={(e) => handleServerSelect(e.target.value)}
          value={selectedServer || ""}
        >
          <option value="">Select a server</option>
          {serverData.map((server) => (
            <option key={server.id} value={server.id}>
              {server.name}
            </option>
          ))}
        </select>
      </div>

      {/* Channel selection dropdown */}
      {selectedServer && selectedServerData && (
        <div>
          <label htmlFor="channelSelect">Select Channel:</label>
          <select
            id="channelSelect"
            onChange={(e) => handleChannelSelect(e.target.value)}
            value={selectedChannel || ""}
          >
            <option value="">Select a channel</option>
            {selectedServerData.Channel.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Create Server Button (Available to all users) */}
      {!creatingServer && (
        <div>
          <button onClick={() => setCreatingServer(true)}>Create Server</button>
        </div>
      )}

      {/* Create Server Modal (Available to all users) */}
      {creatingServer && (
        <div>
          <input
            type="text"
            placeholder="Enter new server name"
            value={newServerName}
            onChange={(e) => setNewServerName(e.target.value)}
          />
          <button
            onClick={() => {
              APIClient.createServer(newServerName, token);
              setCreatingServer(false);
            }}
          >
            Create Server
          </button>
          <button onClick={() => setCreatingServer(false)}>Cancel</button>
        </div>
      )}

      {/* Create Channel Button (Only for the server owner) */}
      {isServerOwner && !creatingChannel && (
        <div>
          <button onClick={() => setCreatingChannel(true)}>
            Create Channel
          </button>
        </div>
      )}

      {/* Create Channel Modal (Only for the server owner) */}
      {creatingChannel && isServerOwner && (
        <div>
          <input
            type="text"
            placeholder="Enter channel name"
            value={newChannelData.name}
            onChange={(e) =>
              setNewChannelData({ ...newChannelData, name: e.target.value })
            }
          />
          <select
            value={newChannelData.type}
            onChange={(e) =>
              setNewChannelData({ ...newChannelData, type: e.target.value })
            }
          >
            <option value="TEXT">Text</option>
            <option value="VOICE">Voice</option>
          </select>
          <button
            onClick={() => {
              APIClient.createChannel(
                selectedServer,
                newChannelData.name,
                newChannelData.type,
                token
              );
              setCreatingChannel(false);
            }}
          >
            Create Channel
          </button>
          <button onClick={() => setCreatingChannel(false)}>Cancel</button>
        </div>
      )}
      {JSON.stringify(serverData)}
    </div>
  );
}
