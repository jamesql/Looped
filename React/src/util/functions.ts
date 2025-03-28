import { Role } from "../../../Types/serverTypes";

  // check if user has certain permissions
export const checkPermissions = (serverId: string, userRoles: Role[], permission: number): boolean => {
    // Check if the user has the required permissions
    for (const role of userRoles) {
      // Assuming role.permissions is an array of permissions
      if (role.permissions.includes(permission.toString())) {
        return true;
      }
    }
    return false;
  };