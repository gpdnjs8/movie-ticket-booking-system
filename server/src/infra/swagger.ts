import swaggerJsdoc from "swagger-jsdoc";

/**
 * OpenAPI 문서 정의.
 *
 * `apis`에 지정한 glob 패턴(도메인별 *.routes.ts)에서 `@openapi` JSDoc 주석을 읽어 자동으로 문서에 반영
 */
export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "영화 티켓 예매 시스템 API",
      version: "1.0.0",
      description:
        "회원가입/로그인, 영화·상영·좌석 조회, 예매 API 문서입니다. " +
        "도메인 라우트 구현 시 각 *.routes.ts 파일에 @openapi 주석을 추가하면 자동 반영됩니다.",
    },
    servers: [{ url: "http://localhost:4000", description: "로컬 개발 서버" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/**/*.routes.ts"],
});
