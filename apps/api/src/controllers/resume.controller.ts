import type { Context } from "hono";
import { resumeService } from "../services/resume.service.js";

export const resumeController = {
  async parse(c: Context) {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({ message: "File is required" }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      const result = await resumeService.parse(buffer);
      return c.json(result);
    } catch (error) {
      console.error("Resume parsing error:", error);
      return c.json({ message: "Failed to parse resume" }, 500);
    }
  },
};
