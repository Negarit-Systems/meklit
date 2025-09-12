import { apiClient } from "@/lib/axios";
import type { LoginUser, RegisterUser, VerifyUser } from "@/types/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";

export const USER_KEY = "users";

export function useRegisterUser({ onSuccess }: { onSuccess: () => void }) {
  return useMutation<void, AxiosError, RegisterUser>({
    mutationFn: async (info: RegisterUser) => {
      await apiClient.post("/auth/register", info);
    },
    onSuccess,
    retry: 1,
  });
}


export function useVerifyUser({ onSuccess }: { onSuccess: () => void }) {
    return useMutation<void, AxiosError, VerifyUser>({
        mutationFn: async (info: VerifyUser) => {
            await apiClient.post("/auth/verify", info);
        },
        onSuccess,
        retry: 1,
    });
}


export function useLogin({ onSuccess }: { onSuccess: () => void }) {
    return useMutation<void, AxiosError, LoginUser>({
        mutationFn: async (info: LoginUser) => {
            await apiClient.post("/auth/login", info);
        },
        onSuccess,
        retry: 1,
    });
}


export function useRefreshToken({ onSuccess }: { onSuccess: () => void }) {
    return useMutation<void, AxiosError, void>({
        mutationFn: async () => {
            await apiClient.post("/auth/refresh-token");
        },
        onSuccess,
        retry: 1,
    });
}


export function useLogout({ onSuccess }: { onSuccess: () => void }) {
    return useMutation<void, AxiosError, void>({
        mutationFn: async () => {
            await apiClient.post("/auth/logout");
        },
        onSuccess,
        retry: 1,
    });
}