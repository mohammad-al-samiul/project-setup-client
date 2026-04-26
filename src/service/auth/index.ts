import { api } from "@/lib/axios";
import { LoginData, RegisterData } from "@/schemas/auth/authSchema";

export const loginApi = async (data: LoginData) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
export const registerApi = async (data: RegisterData) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const getProfileApi = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
