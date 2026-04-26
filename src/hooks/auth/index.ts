import { getProfileApi, loginApi, registerApi } from "@/service/auth";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};
export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileApi,
  });
};
