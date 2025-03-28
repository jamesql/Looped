import { Role, Server } from "../../../Types/serverTypes";

  // check if user has certain permissions
export const checkPermissions = (server: Server, userId: string, userRoles: Role[], permission: number): boolean => {
    if (server.ownerId === userId) return true;
    // Check if the user has the required permissions
    for (const role of userRoles) {
      // Assuming role.permissions is an array of permissions
      if (role.serverId === server.id && role.permissions === permission) {
        return true;
      }
    }
    return false;
  };