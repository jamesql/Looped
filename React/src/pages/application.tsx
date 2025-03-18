import React, { useEffect, useState } from "react";
import WebSocketComponent from "@/components/WebSocket";
import { OpCodeHandler } from "@/util/ws";
import { OPCodes } from "../../../Types/socketTypes";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";

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
    </div>
  );
};

export default Application;
