import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import APIClient from "./api/APIClient";
import { WebSocketComponent } from "./components/_ws";

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [serverData, setServerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedServerData, setSelectedServerData] = useState(null);
  const [isServerOwner, setIsServerOwner] = useState(false);

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

  const handleHello = async () => {};

  const handleReady = async () => {};

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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <WebSocketComponent
        onHelloCallback={handleHello}
        onReadyCallback={handleReady}
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
    </div>
  );
}
