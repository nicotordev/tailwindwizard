/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { AddressInfo } from "node:net";
import type { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import type { Page } from "playwright";
import { chromium } from "playwright";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import env from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";

type BlockType = "COMPONENT" | "SECTION" | "PAGE";

const apiRoot = fileURLToPath(new URL("../..", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const frontendRoot = join(repoRoot, "apps", "frontend");

/* -------------------------------------------------- */
/* utils */
/* -------------------------------------------------- */

async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (c) =>
      chunks.push(Buffer.isBuffer(c) ? new Uint8Array(c) : c)
    );
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
  });
}

function pickEntry(vfs: Record<string, string>): string {
  const preferred = ["src/App.tsx", "App.tsx", "src/index.tsx", "index.tsx"];
  for (const p of preferred) if (vfs[p]) return p;
  const tsx = Object.keys(vfs).find((p) => p.endsWith(".tsx"));
  if (tsx) return tsx;
  throw new Error("No valid entry point (.tsx) found");
}

async function materializeVfs(
  root: string,
  vfs: Record<string, string>
): Promise<void> {
  for (const [p, content] of Object.entries(vfs)) {
    const abs = join(root, p);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, content, "utf-8");
  }
}

/* -------------------------------------------------- */
/* tailwind + html */
/* -------------------------------------------------- */

function buildGlobalTailwindCss(): string {
  return `
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);
  --primary: oklch(0.6 0.2 260);
}

body {
  background: var(--background);
  color: var(--foreground);
}
`;
}

function buildIndexHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
${buildGlobalTailwindCss()}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
}

function buildEntryShim(entry: string, blockType: BlockType): string {
  const importPath = entry.startsWith("src/") ? "../" + entry : "../" + entry;

  return `
import React from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify(importPath)};

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function resolveReactAliases(): { find: RegExp; replacement: string }[] {
  const candidates = [
    join(apiRoot, "package.json"),
    join(frontendRoot, "package.json"),
  ];
  const ids = [
    "react",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "react-dom",
    "react-dom/client",
  ] as const;

  for (const candidate of candidates) {
    try {
      const req = createRequire(candidate);
      const resolved = Object.fromEntries(
        ids.map((id) => [id, req.resolve(id)])
      ) as Record<(typeof ids)[number], string>;

      return [
        { find: /^react$/, replacement: resolved["react"] },
        {
          find: /^react\/jsx-runtime$/,
          replacement: resolved["react/jsx-runtime"],
        },
        {
          find: /^react\/jsx-dev-runtime$/,
          replacement: resolved["react/jsx-dev-runtime"],
        },
        { find: /^react-dom$/, replacement: resolved["react-dom"] },
        {
          find: /^react-dom\/client$/,
          replacement: resolved["react-dom/client"],
        },
      ];
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "React dependencies not found. Install react and react-dom in apps/api or ensure apps/frontend dependencies are installed."
  );
}

/* -------------------------------------------------- */
/* screenshot */
/* -------------------------------------------------- */

async function captureAndUpload(page: Page, blockId: string): Promise<void> {
  const viewports = [
    { name: "DESKTOP", width: 1440, height: 900 },
    { name: "TABLET", width: 768, height: 1024 },
    { name: "MOBILE", width: 375, height: 667 },
  ] as const;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    const buffer = await page.screenshot({ 
      type: "jpeg", 
      quality: 90,
      fullPage: true 
    });
    const key = `previews/${blockId}/${vp.name.toLowerCase()}.jpg`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    );

    const url = `${env.r2.publicUrl}/${key}`;

    await prisma.previewAsset.upsert({
      where: { blockId_viewport: { blockId, viewport: vp.name } },
      create: {
        blockId,
        viewport: vp.name,
        url,
        width: vp.width,
        height: vp.height,
      },
      update: { url },
    });

    if (vp.name === "DESKTOP") {
      await prisma.block.update({
        where: { id: blockId },
        data: { screenshot: url },
      });
    }
  }
}

/* -------------------------------------------------- */
/* vite */
/* -------------------------------------------------- */

async function startVite(root: string): Promise<{
  server: ViteDevServer;
  url: string;
}> {
  const reactAliases = resolveReactAliases();
  const server = await createServer({
    root,
    plugins: [react()],
    logLevel: "error",
    resolve: {
      alias: reactAliases,
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 0,
      fs: {
        allow: [repoRoot, root],
      },
    },
  });

  await server.listen();

  const address = server.httpServer?.address() as AddressInfo;
  if (!address.port) throw new Error("Vite failed to bind port");

  return {
    server,
    url: `http://127.0.0.1:${address.port.toString()}`,
  };
}

/* -------------------------------------------------- */
/* service */
/* -------------------------------------------------- */

export const renderService = {
  async processJob(jobId: string): Promise<void> {
    const job = await prisma.renderJob.findUnique({
      where: { id: jobId },
      include: {
        block: {
          include: {
            codeBundle: { include: { blockFiles: true } },
          },
        },
      },
    });

    if (!job) return;

    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
    let vite: ViteDevServer | null = null;
    let workdir: string | null = null;

    try {
      const vfs: Record<string, string> = {};

      if (job.block.codeBundle?.blockFiles) {
        for (const file of job.block.codeBundle.blockFiles) {
          if (file.content) {
            vfs[file.path] = file.content;
          } else {
            const res = await r2Client.send(
              new GetObjectCommand({
                Bucket: env.r2.bucketName,
                Key: `bundles/${job.blockId}/files/${file.path}`,
              })
            );
            if (res.Body) {
              vfs[file.path] = await streamToString(res.Body as Readable);
            }
          }
        }
      } else {
        throw new Error("No code bundle found for this block.");
      }

      const entry = pickEntry(vfs);

      workdir = await mkdtemp(join(tmpdir(), "vite-render-"));
      await materializeVfs(workdir, vfs);

      await mkdir(join(workdir, "src"), { recursive: true });
      await writeFile(
        join(workdir, "src/main.tsx"),
        buildEntryShim(entry, job.block.type as BlockType),
        "utf-8"
      );

      await writeFile(join(workdir, "index.html"), buildIndexHtml(), "utf-8");

      const { server, url } = await startVite(workdir);
      vite = server;

      browser = await chromium.launch({ 
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });
      const context = await browser.newContext({ deviceScaleFactor: 2 });

      await context.route("**/*", async (route) => {
        const u = route.request().url();
        if (
          u.startsWith(url) ||
          u.startsWith("https://cdn.jsdelivr.net") ||
          u.startsWith("data:")
        ) {
          await route.continue();
        } else {
          await route.abort();
        }
      });

      const page = await context.newPage();

      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForSelector("#root > *", { timeout: 15000 });

      await captureAndUpload(page, job.blockId);

      await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });
    } catch (err) {
      await prisma.renderJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          error: err instanceof Error ? err.message : "unknown error",
        },
      });
    } finally {
      if (browser) await browser.close();
      if (vite) await vite.close();
      if (workdir) await rm(workdir, { recursive: true, force: true });
    }
  },
};
