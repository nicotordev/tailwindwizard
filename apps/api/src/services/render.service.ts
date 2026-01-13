import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { Readable } from "node:stream";
import type { Page } from "playwright";
import { chromium } from "playwright";
import env from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";

type BlockType = "COMPONENT" | "SECTION" | "PAGE";

async function captureAndUpload(page: Page, blockId: string): Promise<void> {
  const viewports = [
    { name: "DESKTOP", width: 1440, height: 900 },
    { name: "TABLET", width: 768, height: 1024 },
    { name: "MOBILE", width: 375, height: 667 },
  ] as const;

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // Wait a bit for layout and animations to settle
    await page.waitForTimeout(800);

    const buffer = await page.screenshot({ type: "jpeg", quality: 85 });
    const key = `previews/${blockId}/${vp.name.toLowerCase()}.jpg`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucketName,
        Key: key,
        Body: buffer,
        ContentType: "image/jpeg",
      })
    );

    const publicUrl = `${env.r2.publicUrl}/${key}`;

    await prisma.previewAsset.upsert({
      where: {
        blockId_viewport: {
          blockId,
          viewport: vp.name,
        },
      },
      create: {
        blockId,
        viewport: vp.name,
        url: publicUrl,
        width: vp.width,
        height: vp.height,
      },
      update: {
        url: publicUrl,
        width: vp.width,
        height: vp.height,
      },
    });

    if (vp.name === "DESKTOP") {
      await prisma.block.update({
        where: { id: blockId },
        data: { screenshot: publicUrl },
      });
    }
  }
}

async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => {
      chunks.push(
        Buffer.isBuffer(chunk) ? new Uint8Array(chunk) : (chunk as Uint8Array)
      );
    });
    stream.on("error", reject);
    stream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf-8"));
    });
  });
}

interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

async function execCmd(
  cmd: string,
  args: readonly string[],
  cwd: string
): Promise<ExecResult> {
  return await new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += String(d)));
    child.stderr.on("data", (d) => (stderr += String(d)));
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

function pickEntry(vfs: Record<string, string>): string {
  const keys = Object.keys(vfs);
  const preferred = ["src/App.tsx", "App.tsx", "src/index.tsx", "index.tsx"];
  for (const p of preferred) if (vfs[p] != null) return p;

  const tsx = keys.find((p) => p.endsWith(".tsx"));
  if (tsx) return tsx;

  const html = keys.find((p) => p.endsWith(".html"));
  if (html) return html;

  throw new Error("No valid entry point found (.tsx or .html).");
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

function buildGlobalTailwindCss(): string {
  // ✅ Esto es lo mínimo para que Tailwind + shadcn (tokens) funcionen en el preview.
  // - @tailwind base/components/utilities habilita preflight + utilities
  // - @layer base define bg/text usando variables shadcn
  // - :root/.dark define variables (puedes pegar tu theme completo aquí)
  return `
@tailwind base;
@tailwind components;
@tailwind utilities;

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.75rem;

  /* defaults “neutros” para que bg-background/text-foreground existan */
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.2 0 0);

  --primary: oklch(0.45 0.18 290);
  --primary-foreground: oklch(0.98 0 0);

  --secondary: oklch(0.95 0.04 230);
  --secondary-foreground: oklch(0.3 0.02 290);

  --muted: oklch(0.96 0.01 290);
  --muted-foreground: oklch(0.55 0.05 290);

  --accent: oklch(0.93 0.03 290);
  --accent-foreground: oklch(0.3 0.02 290);

  --destructive: oklch(0.6 0.18 20);
  --border: oklch(0.9 0.02 290);
  --input: oklch(0.9 0.02 290);
  --ring: oklch(0.45 0.18 290);
}

.dark {
  --background: oklch(0.18 0.06 285);
  --foreground: oklch(0.98 0.01 290);

  --card: oklch(0.22 0.07 285);
  --card-foreground: oklch(0.98 0.01 290);
  --popover: oklch(0.22 0.07 285);
  --popover-foreground: oklch(0.98 0.01 290);

  --primary: oklch(0.7 0.16 235);
  --primary-foreground: oklch(0.18 0.06 285);

  --secondary: oklch(0.3 0.1 290);
  --secondary-foreground: oklch(0.98 0.01 290);

  --muted: oklch(0.3 0.05 285);
  --muted-foreground: oklch(0.7 0.05 290);

  --accent: oklch(0.3 0.1 285);
  --accent-foreground: oklch(0.98 0.01 290);

  --destructive: oklch(0.6 0.18 20);
  --border: oklch(0.35 0.08 285);
  --input: oklch(0.35 0.08 285);
  --ring: oklch(0.7 0.16 235);
}

@layer base {
  * {
    border-color: var(--border);
  }

  body {
    margin: 0;
  }
}
`;
}

function buildWrapperHtml(entryJsPath: string): string {
  const globalCss = buildGlobalTailwindCss();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Preview</title>

  <!-- Tailwind-in-browser (compila el <style type="text/tailwindcss">) -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <style type="text/tailwindcss">
${globalCss}
  </style>
</head>
<body class="bg-background text-foreground">
  <div id="root"></div>
  <script type="module" src="${entryJsPath}"></script>
</body>
</html>`;
}

function buildHtmlWrapper(htmlContent: string): string {
  const globalCss = buildGlobalTailwindCss();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Preview</title>

  <!-- Tailwind-in-browser (compila el <style type="text/tailwindcss">) -->
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <style type="text/tailwindcss">
${globalCss}
  </style>
</head>
<body class="bg-background text-foreground">
  ${htmlContent}
</body>
</html>`;
}

function buildEntryShim(entry: string, blockType: BlockType): string {
  const importPath = "./" + entry;

  // PAGE: asumimos fullscreen (sin wrapper “opinativo”)
  if (blockType === "PAGE") {
    return `
import React from "react";
import { createRoot } from "react-dom/client";
import App from ${JSON.stringify(importPath)};

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root");

createRoot(rootEl).render(React.createElement(App));
`;
  }

  // SECTION: container
  if (blockType === "SECTION") {
    return `
import React from "react";
import { createRoot } from "react-dom/client";
import Section from ${JSON.stringify(importPath)};

function PreviewShell(): JSX.Element {
  return (
    <Section />
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root");

createRoot(rootEl).render(<PreviewShell />);
`;
  }

  // COMPONENT: centrado
  return `
import React from "react";
import { createRoot } from "react-dom/client";
import Component from ${JSON.stringify(importPath)};

function PreviewShell(): JSX.Element {
  return (
    <Component />
  );
}

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Missing #root");

createRoot(rootEl).render(<PreviewShell />);
`;
}

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

    await prisma.renderJob.update({
      where: { id: jobId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
    let workdir: string | null = null;

    try {
      const codeBundle = job.block.codeBundle;
      if (!codeBundle) throw new Error("No code bundle found for this block.");

      const vfs: Record<string, string> = {};

      await Promise.all(
        codeBundle.blockFiles.map(async (file) => {
          if (file.content) {
            vfs[file.path] = file.content;
            return;
          }

          const key = `bundles/${job.blockId}/files/${file.path}`;
          const res = await r2Client.send(
            new GetObjectCommand({ Bucket: env.r2.bucketName, Key: key })
          );

          if (!res.Body) return;

          const content = await streamToString(res.Body as Readable);
          vfs[file.path] = content;
        })
      );

      if (Object.keys(vfs).length === 0) {
        throw new Error("No source files could be retrieved.");
      }

      const entry = pickEntry(vfs);

      // HTML direct
      if (entry.endsWith(".html")) {
        const htmlContent = vfs[entry] ?? "";
        const fullHtml = buildHtmlWrapper(htmlContent);

        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          deviceScaleFactor: 2,
        });

        // ✅ Permite cdn.jsdelivr.net para Tailwind browser
        await context.route("**/*", async (route) => {
          const url = route.request().url();
          const allow =
            url.startsWith("data:") ||
            url.startsWith("blob:") ||
            url.startsWith("https://cdn.jsdelivr.net/");
          if (!allow && !url.startsWith("file://")) {
            await route.abort();
            return;
          }
          await route.continue();
        });

        const page = await context.newPage();
        await page.setContent(fullHtml, { waitUntil: "networkidle" });

        // espera a que haya renderizado todo (Tailwind compiling + layout)
        await page.waitForTimeout(1000);

        await captureAndUpload(page, job.blockId);

        await prisma.renderJob.update({
          where: { id: jobId },
          data: { status: "SUCCEEDED", finishedAt: new Date() },
        });
        return;
      }

      // 1) create temp dir
      workdir = await mkdtemp(join(tmpdir(), "renderjob-"));
      const distDir = join(workdir, "dist");
      await mkdir(distDir, { recursive: true });

      // 2) write files
      await materializeVfs(workdir, vfs);

      // 3) create entry shim with PreviewShell + correct globals
      const blockType = job.block.type as BlockType;
      const entryShim = buildEntryShim(entry, blockType);

      const shimPath = join(workdir, "entry.tsx");
      await writeFile(shimPath, entryShim, "utf-8");

      // 4) bun build -> ESM
      const buildOut = join(distDir, "entry.js");
      const bunRes = await execCmd(
        "bun",
        [
          "build",
          shimPath,
          "--outfile",
          buildOut,
          "--format=esm",
          "--target=browser",
          "--minify",
        ],
        workdir
      );

      if (bunRes.code !== 0) {
        throw new Error(`bun build failed:\n${bunRes.stderr || bunRes.stdout}`);
      }

      // 5) wrapper html (con @tailwind base/components/utilities + tokens shadcn)
      const html = buildWrapperHtml("./dist/entry.js");
      const htmlPath = join(workdir, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      // 6) playwright load local file
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });

      // ✅ No mates Tailwind browser: permite cdn.jsdelivr.net completo
      await context.route("**/*", async (route) => {
        const url = route.request().url();
        const allow =
          url.startsWith("file://") ||
          url.startsWith("https://cdn.jsdelivr.net/");
        if (!allow) {
          await route.abort();
          return;
        }
        await route.continue();
      });

      const page = await context.newPage();
      await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle" });

      // ✅ espera a que React monte algo dentro de #root
      await page.waitForSelector("#root > *", { timeout: 10_000 });
      await page.waitForTimeout(300);

      await captureAndUpload(page, job.blockId);

      await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown error during rendering";
      await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: "FAILED", finishedAt: new Date(), error: message },
      });
    } finally {
      if (browser) await browser.close();
      if (workdir) await rm(workdir, { recursive: true, force: true });
    }
  },
};
