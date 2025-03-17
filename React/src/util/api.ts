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

  


}