import request from "supertest";
import { createApp } from "../../src/app";
import { prisma } from "../../src/infra/prisma";
import { assertTestDatabaseUrl } from "../helpers/assertTestDatabase";

const app = createApp();

async function resetDb() {
  assertTestDatabaseUrl(process.env.DATABASE_URL ?? "");
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("회원가입 성공 시 201, accessToken(바디)과 refreshToken(쿠키)을 발급한다", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "user@example.com",
      password: "password123",
      name: "테스터",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe("user@example.com");
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.headers["set-cookie"]?.[0]).toMatch(/refreshToken=/);
  });

  it("이미 가입된 이메일이면 409를 반환한다", async () => {
    await request(app).post("/api/auth/register").send({
      email: "dup@example.com",
      password: "password123",
      name: "A",
    });
    const res = await request(app).post("/api/auth/register").send({
      email: "dup@example.com",
      password: "password123",
      name: "B",
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      email: "login@example.com",
      password: "password123",
      name: "로그인유저",
    });
  });

  it("올바른 정보로 로그인하면 accessToken을 반환한다", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("비밀번호가 틀리면 401을 반환한다", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
  });
});

describe("POST /api/auth/refresh", () => {
  it("유효한 refreshToken 쿠키가 있으면 새 accessToken을 발급한다", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send({
      email: "refresh@example.com",
      password: "password123",
      name: "리프레시유저",
    });

    const refreshRes = await agent.post("/api/auth/refresh").send();
    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.data.accessToken).toBeDefined();
  });

  it("쿠키가 없으면 401을 반환한다", async () => {
    const res = await request(app).post("/api/auth/refresh").send();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("로그아웃하면 refreshToken 쿠키가 삭제된다", async () => {
    const agent = request.agent(app);
    const registerRes = await agent.post("/api/auth/register").send({
      email: "logout@example.com",
      password: "password123",
      name: "로그아웃유저",
    });
    const accessToken = registerRes.body.data.accessToken;

    const logoutRes = await agent
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers["set-cookie"]?.[0]).toMatch(/refreshToken=;/);
  });

  it("accessToken 없이 로그아웃 요청하면 401을 반환한다", async () => {
    const res = await request(app).post("/api/auth/logout").send();
    expect(res.status).toBe(401);
  });
});
