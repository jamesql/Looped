import React, { useEffect, useState } from "react";
import Cookie from "js-cookie";
import APIClient from "./api/APIClient";
import { WebSocketComponent } from "./components/_ws";

export default function App() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [serverData, setServerData] = useState([]);
  const [loading, setLoading] = useState(true);

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


    </div>
  );
}
