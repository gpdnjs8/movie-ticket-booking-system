import { axiosInstance } from "../axiosInstance";
import { AuthResponse } from "../../types/auth";
import { LoginFormValues, RegisterFormValues } from "../../schemas/auth";

export async function login(values: LoginFormValues): Promise<AuthResponse> {
  const res = await axiosInstance.post<{ data: AuthResponse }>("/api/auth/login", values);
  return res.data.data;
}

export async function register(values: RegisterFormValues): Promise<AuthResponse> {
  const res = await axiosInstance.post<{ data: AuthResponse }>("/api/auth/register", values);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/api/auth/logout");
}
