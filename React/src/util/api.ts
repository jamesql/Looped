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
        password,
        email,
        firstName,
        lastName,
        birthday,
        location
        });
    }

}

export default ApiClient