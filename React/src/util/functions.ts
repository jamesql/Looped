import { Role, Server } from "../../../Types/serverTypes";
import { Permissions } from "../../../Types/permissionsTypes";
import ApiClient from "./api";
import Cookies from "js-cookie";
import { ContentCreateResponse, R2File } from "../../../Types/contentTypes";


if (!global.__FILE_URL_CACHE) {
  global.__FILE_URL_CACHE = new Map<string, CacheEntry>();
}

const fileUrlCache = global.__FILE_URL_CACHE;

// TTL value in milliseconds (3600 seconds = 1 hour)
const TTL = 3500 * 1000;

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
      "Content-Type": resp.contentType,
    },
    body: file,
  });

  if (uploadResponse.ok) {
    return { r2file: resp.r2file };
  } else {
    throw new Error(`Upload failed for ${file.name}.`);
  }
};

export const getCdnFileUrl = async (file: R2File): Promise<string> => {
  // Check if the file exists in cache and is not expired
  const cachedEntry = fileUrlCache.get(file.id);
  if (cachedEntry) {
    const isExpired = Date.now() - cachedEntry.timestamp > TTL;
    if (!isExpired) {
      return cachedEntry.url;
    } else {
      // If expired, remove it from the cache
      fileUrlCache.delete(file.id);
    }
  }

    const token = Cookies.get("access_token") ?? "";
    try{
      const fileResp = await ApiClient.getInstance().getFileById(token, file.id);
      if (fileResp.status === 200) {
        const url = fileResp.data.url;
        // Cache the URL with the current timestamp
        fileUrlCache.set(file.id, { url, timestamp: Date.now() });
        return url;
      }
    } catch (error) {
      console.error("Blacklisted URL given.");
    }
    

    return "about:blank";
};

export const getCdnFileUrlSync = (file: R2File): string | undefined => {
  const cachedEntry = fileUrlCache.get(file.id);
  if (cachedEntry && Date.now() - cachedEntry.timestamp <= TTL) {
    return cachedEntry.url;
  }
  return undefined;
};
