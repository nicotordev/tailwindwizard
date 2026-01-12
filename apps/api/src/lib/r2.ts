import { S3Client } from "@aws-sdk/client-s3";
import env from "../config/env.config.js";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: env.r2.endpoint,
  credentials: {
    accessKeyId: env.r2.accessKeyId,
    secretAccessKey: env.r2.secretAccessKey,
  },
});
