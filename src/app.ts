import express from "express";
import cors from "cors";
import { apiRouter } from "./routes";
import { notFound } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
