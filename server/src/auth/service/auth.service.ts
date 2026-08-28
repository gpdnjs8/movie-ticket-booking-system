import bcrypt from "bcrypt";
import { AppError } from "../../errors/error";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { authRepository } from "../repository/auth.repository";
import { LoginRequestDto, RefreshResponseDto, RegisterRequestDto } from "../dto/auth.dto";

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string };
}

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 10);

export const authService = {
  async register(input: RegisterRequestDto): Promise<TokenPair> {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("이미 가입된 이메일입니다.", "EMAIL_TAKEN");
    }

    const hashed = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await authRepository.create({
      email: input.email,
      password: hashed,
      name: input.name,
    });

    return {
      accessToken: signAccessToken({ userId: user.id.toString(), email: user.email }),
      refreshToken: signRefreshToken({ userId: user.id.toString() }),
      user: { id: user.id.toString(), email: user.email, name: user.name },
    };
  },

  async login(input: LoginRequestDto): Promise<TokenPair> {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized(
        "이메일 또는 비밀번호가 올바르지 않습니다.",
        "INVALID_CREDENTIALS"
      );
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw AppError.unauthorized(
        "이메일 또는 비밀번호가 올바르지 않습니다.",
        "INVALID_CREDENTIALS"
      );
    }

    return {
      accessToken: signAccessToken({ userId: user.id.toString(), email: user.email }),
      refreshToken: signRefreshToken({ userId: user.id.toString() }),
      user: { id: user.id.toString(), email: user.email, name: user.name },
    };
  },

  async refresh(refreshToken: string): Promise<RefreshResponseDto> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized(
        "유효하지 않거나 만료된 리프레시 토큰입니다.",
        "INVALID_REFRESH_TOKEN"
      );
    }

    const user = await authRepository.findById(BigInt(payload.userId));
    if (!user) {
      throw AppError.unauthorized("사용자를 찾을 수 없습니다.", "INVALID_REFRESH_TOKEN");
    }

    return { accessToken: signAccessToken({ userId: user.id.toString(), email: user.email }) };
  },
};
