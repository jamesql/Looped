import React, { useState } from "react";
import { User } from "../../../Types/userTypes";
import { Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";
import classes from "../styles/application.module.css";
import ApiClient from "@/util/api";
import Cookies from "js-cookie";
import { checkPermissions } from "@/util/functions";

interface UserContextDropdownProps {
    user: User;
    server: Server | null | undefined;
    session: User | null | undefined;
    dropdownX: number;
    dropdownY: number;
    setDropdownVisible: (visible: boolean) => void;
}

const UserContextDropdown: React.FC<UserContextDropdownProps> = ({
    user,
    session,
    server,
    dropdownX,
    dropdownY,
    setDropdownVisible
}) => {
    console.log("UserContextDropdown", user, session, server);
    const handleAddFriend = async () => {
        // Function to send a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().sendFriendRequest(
                user.id,
                access_token
            );
            setDropdownVisible(false); // Close the dropdown after sending the request
            console.log(
                "Friend request sent to",
                user.firstName,
                user.lastName
            );
        } catch (error) {
            // Handle error
            console.error("Failed to send friend request:", error);
        }
    };

    const handleRemoveFriend = async () => {
        // Function to remove a friend
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().removeFriend(user.id, access_token);
            setDropdownVisible(false); // Close the dropdown after removing the friend
            console.log("Friend removed:", user.firstName, user.lastName);
        } catch (error) {
            // Handle error
            console.error("Failed to remove friend:", error);
        }
    };

    const handleAccept = async () => {
        // Function to accept a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().acceptFriendRequest(
                user.id,
                access_token
            );
            setDropdownVisible(false); // Close the dropdown after accepting the request
            console.log(
                "Friend request accepted from",
                user.firstName,
                user.lastName
            );
        } catch (error) {
            // Handle error
            console.error("Failed to accept friend request:", error);
        }
    };

    const handleDecline = async () => {
        // Function to decline a friend request
        const access_token = Cookies.get("access_token");
        if (!access_token) {
            console.error("No access token found");
            return;
        }
        try {
            await ApiClient.getInstance().declineFriendRequest(
                user.id,
                access_token
            );
            setDropdownVisible(false); // Close the dropdown after declining the request
            console.log(
                "Friend request declined from",
                user.firstName,
                user.lastName
            );
        } catch (error) {
            // Handle error
            console.error("Failed to decline friend request:", error);
        }
    };

    const isSelf = session?.id === user.id; // Check if the user is the same as the session user
    const isFriend = session?.friends
        ? session?.friends.some((u) => u.id === user.id)
        : false;
    const incomingRequest = session?.friendRequestsReceived
        ? session?.friendRequestsReceived.some(
              (request) => request.id === user.id
          )
        : false; // Check if the user has sent a friend request to this member
    const outgoingRequest = session?.friendRequestsSent
        ? session?.friendRequestsSent.some((request) => request.id === user.id)
        : false; // Check if this member has sent a friend request to the user
    const isAdmin = server ? checkPermissions(
                          server,
                          session!.id,
                          session!.roles!,
                          Permissions.ADMIN
                        ) : false;
    if(isSelf)
        return <></>
    return (
        <ul
            className={classes.custom_dropdown}
            style={{
                top: dropdownY,
                left: dropdownX,
            }}
        >
            {/** Friend Request Buttons  */}
            {!isSelf && isFriend && (
                <li onClick={() => handleRemoveFriend()}>Remove Friend</li>
            )}
            {!isSelf && incomingRequest && (
                <li onClick={() => handleAccept()}>Accept Request</li>
            )}
            {!isSelf && incomingRequest && (
                <li onClick={() => handleDecline()}>Deny Request</li>
            )}
            {!isSelf && !isFriend && !incomingRequest && !outgoingRequest && (
                <li onClick={() => handleAddFriend()}>Add Friend</li>
            )}

            {/** Moderation tools  */}
            {!isSelf && (
                <li
                    onClick={() =>
                        console.log({
                            incoming_request: incomingRequest,
                            outgoing_request: outgoingRequest,
                            is_friend: isFriend,
                        })
                    }
                >
                    Report
                </li>
            )}
            {isAdmin && !isSelf && (
                <li onClick={() => console.log("Ban")}>Ban</li>
            )}
            {isAdmin && !isSelf && (
                <li onClick={() => console.log("Kick")}>Kick</li>
            )}
        </ul>
    );
};

export default UserContextDropdown;
