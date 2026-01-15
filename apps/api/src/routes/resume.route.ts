import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { resumeController } from "../controllers/resume.controller.js";

const resumeApp = new OpenAPIHono();

const ResumeParseSchema = z.object({
  text: z.string(),
  email: z.string().optional(),
  website: z.string().optional(),
  github: z.string().optional(),
  twitter: z.string().optional(),
  suggestedBio: z.string().optional(),
}).openapi("ResumeParse");

const parseResumeRoute = createRoute({
  method: "post",
  path: "/parse",
  tags: ["Resume"],
  summary: "Parse resume PDF",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            file: z.instanceof(File).openapi({ format: "binary" }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ResumeParseSchema,
        },
      },
      description: "Parsed resume data",
    },
    400: { description: "Bad request" },
    500: { description: "Server error" },
  },
});

resumeApp.openapi(parseResumeRoute, (c) => resumeController.parse(c));

export default resumeApp;
