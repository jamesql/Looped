import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private baseUrl: string;

  // Private constructor to enforce the singleton pattern
  private constructor() {
    this.baseUrl = 'http://localhost/api';  // Your API base URL
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

  // Example: Get server data for a user
  public async getServerData(token: string): Promise<any> {
    await this.addAuthHeader(token);  // Add Authorization header
    try {
      const response: AxiosResponse = await this.axiosInstance.get('/get-server-data', {});
      return response.data; // Return the server data
    } catch (error) {
      console.error('Error fetching server data:', error);
      throw error; // Rethrow the error so the caller can handle it
    }
  }

  // Example: Create a server
  public async createServer(name: string, token: string): Promise<any> {
    this.addAuthHeader(token);  // Add Authorization header
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/create-server', {
        name,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating server:', error);
      throw error;
    }
  }

  // Example: Join a server
  public async joinServer(serverId: string, token: string): Promise<any> {
    this.addAuthHeader(token);
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/join-server', {
        serverId,
      });
      return response.data;
    } catch (error) {
      console.error('Error joining server:', error);
      throw error;
    }
  }

  // Example: Create a channel
  public async createChannel(serverId: string, channelName: string, channelType: string, token: string): Promise<any> {
    this.addAuthHeader(token);
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/create-channel', {
        serverId,
        channelName,
        channelType,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  // Example: Send a message
  public async sendMessage(serverId: string, channelId: string, content: string, token: string): Promise<any> {
    this.addAuthHeader(token);
    try {
      const response: AxiosResponse = await this.axiosInstance.post('/message', {
        serverId,
        channelId,
        content,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

}

export default ApiClient.getInstance();
