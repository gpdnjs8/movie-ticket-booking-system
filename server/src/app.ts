import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { errorHandler } from "./middleware/error.middleware";
import { swaggerSpec } from "./infra/swagger";
import authRoutes from "./auth/routes/auth.routes";
import moviesRoutes from "./movies/routes/movies.routes";
import theatersRoutes from "./movies/routes/theaters.routes";
import showtimesRoutes from "./movies/routes/showtimes.routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/auth", authRoutes);
  app.use("/api/movies", moviesRoutes);
  app.use("/api/theaters", theatersRoutes);
  app.use("/api/showtimes", showtimesRoutes);

  app.use((_req, res) => {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "요청한 경로를 찾을 수 없습니다." } });
  });

  app.use(errorHandler);

  return app;
}
