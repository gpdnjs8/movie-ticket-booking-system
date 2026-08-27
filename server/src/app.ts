import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use((_req, res) => {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "요청한 경로를 찾을 수 없습니다." } });
  });

  app.use(errorHandler);

  return app;
}
