import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  // Private constructor to enforce the singleton pattern
  private constructor() {
    this.baseUrl = 'http://localhost:80/';  // Your API base URL
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get the single instance of the client
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  // Helper method to add Authorization header for all requests
  private addAuthHeader(token: string) {
    this.axiosInstance.defaults.headers['Authorization'] = token;
  }



  // make login request
    public async login(username: string, password: string): Promise<AxiosResponse> {
        return this.axiosInstance.post('/auth/login', {
            email: username,
            password: password
        });
    }

    // make signup request
    /**
     * 
     */
    public async signup(email: string, password: string, firstName: string, lastName: string, birthday: string, location: string ): Promise<AxiosResponse> {
        return this.axiosInstance.post('/auth/signup', {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        birthday: birthday,
        location: location
        });
    }

    // edit user post request
    public async editUser(firstName: string, lastName: string, location: string, status: string, token: string, avatarId?: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/user/edit', {
            firstName: firstName,
            lastName: lastName,
            location: location,
            //avatar: avatar,
            status: status,
            avatarId: avatarId
        });
    }

    // join server post request
    public async joinServer(serverId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/server/join', {
            code: serverId,
        });
    }

    // create server post request
    public async createServer(name: string, desc: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/server/create', {
            name: name,
            description: desc,
        });
    }

    // edit server info post request
    public async editServer(serverId: string, name: string, desc: string, website: string, token: string, iconId?: string, bannerId?: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/server/edit', {
            serverId: serverId,
            name: name,
            description: desc,
            iconId: iconId,
            bannerId: bannerId,
            website: website
        });
    }

    // delete server post request
    public async deleteServer(serverId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/server/delete', {
            serverId: serverId,
        });
    }

    // create channel post request
    public async createChannel(serverId: string, name: string, desc: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/channel/create', {
            serverId: serverId,
            name: name,
            description: desc,
        });
    }

    // edit channel post request
    public async editChannel(channelId: string, name: string, desc: string, permissionRequired: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/channel/edit', {
            channelId: channelId,
            name: name,
            description: desc,
            permissionRequired: permissionRequired,
        });
    }

    // delete channel post request
    public async deleteChannel(channelId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/channel/delete', {
            channelId: channelId,
        });
    }

    // create message route
    public async createMessage(channelId: string, content: string, token: string, fileId?: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/message/create', {
            channelId: channelId,
            content: content,
            fileId: fileId,
        });
    }

    // edit message route
    public async editMessage(messageId: string, content: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/message/edit', {
            messageId: messageId,
            content: content,
        });
    }

    // delete message route
    public async deleteMessage(messageId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post('/api/message/delete', {
            messageId: messageId,
        });
    }

    // get user data
    public async getUserData(token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.get(`/api/user/get-user-data`);
    }

    // create new file and get upload url
    public async generateFileUrl(token: string, fileName : string, contentType: string, contentLen: number): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post(`/api/content/create`, {
            contentType: contentType,
            contentLength: contentLen,
            fileName: fileName,
        });
    }

    // get file url
    public async getFileById(token: string, fileId : string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.get(`/api/content/files/` + fileId);
    }

    // generate invite code
    public async generateInviteCode(serverId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.get(`/api/server/invite/${serverId}`, {});
    }

    // send friend request
    public async sendFriendRequest(userId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post(`/api/direct/add-friend`, {
            friendId: userId,
        });
    }

    // accept friend request
    public async acceptFriendRequest(requestId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post(`/api/direct/accept-friend`, {
            friendId: requestId,
        });
    }

    // decline friend request
    public async declineFriendRequest(requestId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post(`/api/direct/decline-friend`, {
            friendId: requestId,
        });
    }

    // remove friend
    public async removeFriend(friendId: string, token: string): Promise<AxiosResponse> {
        this.addAuthHeader(token);
        return this.axiosInstance.post(`/api/direct/remove-friend`, {
            friendId: friendId,
        });
    }
}

export default ApiClient