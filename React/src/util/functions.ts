import { Role, Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";

  // check if user has certain permissions
export const checkPermissions = (server: Server, userId: string, userRoles: Role[], permission: number): boolean => {
    // check if the user is the owner of the server
    if (server.ownerId === userId) {
        return true; // owner has all permissions
    }

    const serverRoles = userRoles.filter((role) => role.serverId === server.id); // filter roles that belong to the server

    if (serverRoles.length === 0) return permission === Permissions.MEMBER;


    // check if user has any roles in the server
    const role = serverRoles.find((role) => (role.permissions & permission) === permission);

    // if a role with the required permission is found, return true
    if (role) {
        return true;
    }

    // otherwise return false
    return false;
  };