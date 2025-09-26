import $axios from "@/axios/axios";
import type { AxiosRequestConfig } from "axios";

export type Role = "user" | "admin";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: Role;
  submissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
}

class AuthService {
  private accessToken: string | null = null;

  constructor() {
    this.accessToken = localStorage.getItem("accessToken");
  }

  async register(
    username: string,
    email: string,
    password: string,
    role?: string
  ): Promise<AuthResponse> {
    try {
      const response = await $axios.post<AuthResponse>(
        `/auth/register`,
        { username, email, password, role },
        { withCredentials: true }
      );

      this.setAccessToken(response.data.accessToken);
      return response.data;
    } catch {
      throw new Error("Registration failed");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await $axios.post<AuthResponse>(`/auth/login`, {
        email,
        password,
      });

      this.setAccessToken(response.data.accessToken);
      return response.data;
    } catch {
      throw new Error("Login failed");
    }
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await $axios.post<{ accessToken: string }>(
        `/auth/refresh-token`,
        {}
      );

      this.setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } catch {
      throw new Error("Token refresh failed");
    }
  }

  async logout(): Promise<void> {
    await $axios.post(
      `/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    this.clearAccessToken();
  }

  private setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem("accessToken", token);
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    localStorage.removeItem("accessToken");
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async makeAuthenticatedRequest<T = any>(
    url: string,
    options: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await $axios({
        url,
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await this.refreshToken();
          return this.makeAuthenticatedRequest<T>(url, options);
        } catch {
          this.clearAccessToken();
          throw new Error("Authentication failed");
        }
      }
      throw error;
    }
  }
}

export const authService = new AuthService();
