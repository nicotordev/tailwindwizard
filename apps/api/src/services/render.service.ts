import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import env from "../config/env.config.js";
import sharp from "sharp";

export const renderService = {
  async processJob(jobId: string) {
    const job = await prisma.renderJob.findUnique({
      where: { id: jobId },
      include: { block: true },
    });

    if (!job) return;

    await prisma.renderJob.update({
      where: { id: jobId },
      data: { status: "RUNNING", startedAt: new Date(), attempts: { increment: 1 } },
    });

    try {
      const viewports = [
        { name: "MOBILE", width: 375, height: 667 },
        { name: "TABLET", width: 768, height: 1024 },
        { name: "DESKTOP", width: 1440, height: 900 },
      ] as const;

      // Clear existing previews for this block if regenerating
      await prisma.previewAsset.deleteMany({
        where: { blockId: job.blockId },
      });

      for (const vp of viewports) {
        // Generate a colored placeholder with the block title
        const svg = `
          <svg width="${String(vp.width)}" height="${String(vp.height)}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#9333ea;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grad)" />
            <text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
              ${job.block.title} - ${vp.name}
            </text>
            <text x="50%" y="55%" font-family="sans-serif" font-size="14" fill="rgba(255,255,255,0.7)" text-anchor="middle">
              TailwindWizard Preview
            </text>
          </svg>
        `;

        const buffer = await sharp(Buffer.from(svg)).webp().toBuffer();
        const objectKey = `previews/${job.blockId}/${vp.name.toLowerCase()}.webp`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: env.r2.bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: "image/webp",
          })
        );

        const url = `${env.r2.publicUrl}/${objectKey}`;

        await prisma.previewAsset.create({
          data: {
            blockId: job.blockId,
            viewport: vp.name,
            url,
            width: vp.width,
            height: vp.height,
            watermarked: true,
          },
        });
      }

      await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });
    } catch (error: unknown) {
      console.error(`Render job ${jobId} failed:`, error);
      const message = error instanceof Error ? error.message : "Unknown error during rendering";
      await prisma.renderJob.update({
        where: { id: jobId },
        data: { 
          status: "FAILED", 
          finishedAt: new Date(), 
          error: message
        },
      });
    }
  },
};
