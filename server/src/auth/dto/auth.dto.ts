import { z } from "zod";

export const registerRequestSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().min(1, "이름을 입력해주세요."),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponseDto {
  accessToken: string;
  user: UserResponseDto;
}

export interface RefreshResponseDto {
  accessToken: string;
}
