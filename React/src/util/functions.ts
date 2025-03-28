import { Role, Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";
import ApiClient from "./api";
import Cookies from "js-cookie";
import { ContentCreateResponse, R2File } from "../../../Types/contentTypes";

// check if user has certain permissions
export const checkPermissions = (
  server: Server,
  userId: string,
  userRoles: Role[],
  permission: number
): boolean => {
  // check if the user is the owner of the server
  if (server.ownerId === userId) {
    return true; // owner has all permissions
  }

  const serverRoles = userRoles.filter((role) => role.serverId === server.id); // filter roles that belong to the server

  if (serverRoles.length === 0) return permission === Permissions.MEMBER;

  // check if user has any roles in the server
  const role = serverRoles.find(
    (role) => (role.permissions & permission) === permission
  );

  // if a role with the required permission is found, return true
  if (role) {
    return true;
  }

  // otherwise return false
  return false;
};

export const uploadCdnFile = async (
  file: File
): Promise<{ r2file: R2File }> => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size exceeds 5MB limit.");
  }

  const response = await ApiClient.getInstance().generateFileUrl(
    Cookies.get("access_token") || "",
    file.name,
    file.type,
    file.size
  );

  const resp = response.data as ContentCreateResponse;

  const presignedUrl = resp.url;
  console.log(`Uploading ${file.name} to R2 via:`, presignedUrl);

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if(uploadResponse.ok) {
    return {r2file: resp.r2file};
  }
  else {
    throw new Error(`Upload failed for ${file.name}.`);
  }
};

export const getCdnFileUrl = async (file: R2File): Promise<string> => {
  try {
    const token = Cookies.get("access_token") ?? "";
    const fileResp = await ApiClient.getInstance().getFileById(token, file.id);

    if (fileResp.status === 200) {
      return fileResp.data.url;
    }
  } catch (error) {
    console.error("Error fetching file URL:", error);
  }
  return "";
}
