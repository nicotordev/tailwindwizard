import { prisma } from "../db/prisma.js";
import { r2Client } from "../lib/r2.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import env from "../config/env.config.js";
import { chromium } from "playwright";
import { Readable } from "stream";

// Helper to read stream
async function streamToString(stream: Readable): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
}

export const renderService = {
  async processJob(jobId: string) {
    const job = await prisma.renderJob.findUnique({
      where: { id: jobId },
      include: {
        block: {
          include: {
            codeBundle: {
              include: {
                blockFiles: true,
              },
            },
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

    let browser = null;

    try {
      const codeBundle = job.block.codeBundle;
      if (!codeBundle) {
        throw new Error("No code bundle found for this block.");
      }

      // 1. Fetch all file contents
      const vfs: Record<string, string> = {};
      
      // Parallel fetch
      await Promise.all(codeBundle.blockFiles.map(async (file) => {
        try {
            // Try fetching the individual file (new convention)
            // Convention: bundles/{blockId}/files/{path}
            // But wait, the path might contain slashes. S3 handles keys with slashes fine.
            const key = `bundles/${job.blockId}/files/${file.path}`;
            const getCmd = new GetObjectCommand({
                Bucket: env.r2.bucketName,
                Key: key,
            });
            const response = await r2Client.send(getCmd);
            if (response.Body) {
                const content = await streamToString(response.Body as Readable);
                vfs[file.path] = content;
            }
        } catch (err) {
            console.warn(`Failed to fetch file ${file.path} from R2`, err);
            // Fallback: If it's a legacy single-file bundle, maybe we can recover?
            // For now, ignore.
        }
      }));

      if (Object.keys(vfs).length === 0) {
        throw new Error("No source files could be retrieved.");
      }

      // 2. Identify Entry Point
      // Priority: App.tsx, index.tsx, or the first .tsx file
      let entryPoint: string | undefined = Object.keys(vfs).find(p => p === "App.tsx" || p === "src/App.tsx");
      if (!entryPoint) entryPoint = Object.keys(vfs).find(p => p === "index.tsx" || p === "src/index.tsx");
      if (!entryPoint) entryPoint = Object.keys(vfs).find(p => p.endsWith(".tsx"));
      
      if (!entryPoint) {
         throw new Error("No valid entry point (.tsx) found.");
      }

      // 3. Prepare Browser Script
      // We need to inject the VFS and a loader.
      
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: "hsl(var(--border))",
              input: "hsl(var(--input))",
              ring: "hsl(var(--ring))",
              background: "hsl(var(--background))",
              foreground: "hsl(var(--foreground))",
              primary: {
                DEFAULT: "hsl(var(--primary))",
                foreground: "hsl(var(--primary-foreground))",
              },
              secondary: {
                DEFAULT: "hsl(var(--secondary))",
                foreground: "hsl(var(--secondary-foreground))",
              },
              destructive: {
                DEFAULT: "hsl(var(--destructive))",
                foreground: "hsl(var(--destructive-foreground))",
              },
              muted: {
                DEFAULT: "hsl(var(--muted))",
                foreground: "hsl(var(--muted-foreground))",
              },
              accent: {
                DEFAULT: "hsl(var(--accent))",
                foreground: "hsl(var(--accent-foreground))",
              },
              popover: {
                DEFAULT: "hsl(var(--popover))",
                foreground: "hsl(var(--popover-foreground))",
              },
              card: {
                DEFAULT: "hsl(var(--card))",
                foreground: "hsl(var(--card-foreground))",
              },
            },
            borderRadius: {
              lg: "var(--radius)",
              md: "calc(var(--radius) - 2px)",
              sm: "calc(var(--radius) - 4px)",
            },
          },
        },
      }
    </script>
    <style>
      :root {
        --background: 0 0% 100%;
        --foreground: 222.2 84% 4.9%;
        --card: 0 0% 100%;
        --card-foreground: 222.2 84% 4.9%;
        --popover: 0 0% 100%;
        --popover-foreground: 222.2 84% 4.9%;
        --primary: 222.2 47.4% 11.2%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96.1%;
        --secondary-foreground: 222.2 47.4% 11.2%;
        --muted: 210 40% 96.1%;
        --muted-foreground: 215.4 16.3% 46.9%;
        --accent: 210 40% 96.1%;
        --accent-foreground: 222.2 47.4% 11.2%;
        --destructive: 0 84.2% 60.2%;
        --destructive-foreground: 210 40% 98%;
        --border: 214.3 31.8% 91.4%;
        --input: 214.3 31.8% 91.4%;
        --ring: 222.2 84% 4.9%;
        --radius: 0.5rem;
      }
    </style>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@18.2.0",
          "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
          "lucide-react": "https://esm.sh/lucide-react@0.294.0",
          "framer-motion": "https://esm.sh/framer-motion@10.16.4",
          "clsx": "https://esm.sh/clsx@2.0.0",
          "tailwind-merge": "https://esm.sh/tailwind-merge@2.1.0"
        }
      }
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-white">
    <div id="root" class="w-full h-full flex items-center justify-center"></div>

    <script>
      // 1. Inject VFS
      window.__VFS__ = ${JSON.stringify(vfs)};
      window.__ENTRY__ = "${entryPoint}";

      // 2. Blob URL Cache
      window.__BLOBS__ = {};

      // 3. Register Custom Babel Plugin to Rewrite Imports
      Babel.registerPlugin("vfs-resolver", {
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value;
            if (source.startsWith(".")) {
               // Resolve path (simplified)
               // Assume flat structure or basic relative resolution
               // TODO: Real path resolution
               let targetPath = source.replace(/^\\.\\//, ""); // remove ./
               if (!targetPath.endsWith(".tsx") && !targetPath.endsWith(".ts")) {
                  // try extensions
                  if (window.__VFS__[targetPath + ".tsx"]) targetPath += ".tsx";
                  else if (window.__VFS__[targetPath + ".ts"]) targetPath += ".ts";
               }
               
               if (window.__BLOBS__[targetPath]) {
                 path.node.source.value = window.__BLOBS__[targetPath];
               } else {
                 console.warn("Could not resolve import:", source);
               }
            }
          }
        }
      });

      // 4. Loader Function
      async function loadVFS() {
        const sortedFiles = Object.keys(window.__VFS__); 
        // Naive dependency handling: Just process all files and hope Babel plugin handles rewrites lazy enough?
        // Actually, for ES modules, we need to create the Blobs for ALL files first, so the URLs exist when we import.
        
        // Step A: Create Blobs for everything (Initial pass)
        // We can't rewrite imports yet because we don't know the URLs of dependencies.
        // But we can generate the URLs first? No, the URL points to the Blob, and the Blob contains the code.
        // Circular dependency: Code needs URL of Dep, Dep needs URL of SubDep.
        // Solution: Use a registry or variable replacement?
        // EASIER: Use "Data URIs" or just pre-allocate URLs? No.
        
        // CORRECT APPROACH with ES Modules in Browser:
        // We must process in topological order OR use a module loader (SystemJS).
        // Since we want to use native ES modules (via type="module"), we are stuck unless we use a Service Worker to intercept network requests.
        // Service Worker is the cleanest "Virtual File System" for browser.
        // But setup is complex for a screenshot job.
        
        // FALLBACK: Bundle it! 
        // We will just concatenate files? No, scope issues.
        
        // Let's try the Babel Transform loop with a multi-pass or just naive "Pre-process all to find dependencies"?
        
        // SIMPLIFIED STRATEGY: 
        // 1. Process all "leaf" nodes (no local imports).
        // 2. Then process nodes that import them.
        // Too complex.
        
        // SYSTEMJS APPROACH (Simulated):
        // Convert everything to CommonJS-ish and use a tiny require() implementation?
        // Babel "transform" with "presets: ['env']" -> "modules": "commonjs"
        
        const modules = {};
        window.require = function(path) {
            // resolve path
            const name = path.replace(/^\\.\\//, "").replace(/\\.(tsx|ts|js|jsx)$/, "");
            // Find key in modules
            const found = Object.keys(modules).find(k => k.includes(name));
            if (modules[found]) return modules[modules[found]];
            console.error("Module not found:", path);
            return {};
        };

        // Standard libs
        const libs = {
            "react": React,
            "react-dom/client": ReactDOM,
            "lucide-react": LucideReact, // We need to expose this from CDN
            "framer-motion": FramerMotion,
            "clsx": { clsx: window.clsx },
            "tailwind-merge": { twMerge: window.tailwindMerge }
        };
        // Mock require for libs
        const oldRequire = window.require;
        window.require = (path) => {
            if (libs[path]) return libs[path];
            return oldRequire(path);
        }

        // Compile all files to CommonJS
        for (const [path, code] of Object.entries(window.__VFS__)) {
            if (path.endsWith(".css")) {
                // Inject CSS
                const style = document.createElement("style");
                style.textContent = code;
                document.head.appendChild(style);
                continue;
            }

            try {
                const result = Babel.transform(code, {
                    presets: ["react", "typescript", ["env", { modules: "commonjs" }]],
                    filename: path,
                });
                
                // Wrap in a function
                const module = { exports: {} };
                const func = new Function("exports", "require", "module", "React", result.code);
                
                // We delay execution? No, simplistic app usually runs immediately.
                // But we need to store the factory to execute later when required?
                // For simplicity: Store the factory.
                modules[path] = module.exports; // placeholder
                
                // Execution wrapper
                modules[path] = (() => {
                   const m = { exports: {} };
                   func(m.exports, window.require, m, window.React);
                   return m.exports;
                })();

            } catch (err) {
                console.error("Compilation error in " + path, err);
            }
        }

        // Run Entry Point
        const entryExports = modules[window.__ENTRY__];
        if (entryExports && entryExports.default) {
             const root = ReactDOM.createRoot(document.getElementById('root'));
             root.render(React.createElement(entryExports.default));
        }
      }
    </script>
    
    <!-- Load Dependencies Globals for our 'require' hack -->
    <script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/lucide-react@0.294.0/dist/umd/lucide-react.min.js"></script>
    <script src="https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js"></script>
    <script src="https://unpkg.com/clsx@2.0.0/dist/clsx.min.js"></script>
    <script src="https://unpkg.com/tailwind-merge@2.1.0/dist/bundle.js"></script>

    <script>
       // Expose globals for the require map
       window.React = window.React;
       window.ReactDOM = window.ReactDOM;
       window.LucideReact = window.lucide; // check global name
       window.FramerMotion = window.Motion; // check global name
       window.clsx = window.clsx;
       window.tailwindMerge = window.twMerge;
    </script>
    
    <script>
      // Trigger load
      window.addEventListener('load', () => {
         // Need to wait for Babel
         if (typeof Babel !== 'undefined') {
             // We defined loadVFS above but it relies on vfs var which is not in this scope?
             // Ah, I injected it via template literal into a script block above.
             // Wait, I put the logic inside a function loadVFS but didn't define it in the global scope correctly in the previous block?
             // I will put all logic in one big script block to be safe.
         }
      });
    </script>
</body>
</html>
      `;
      
      // ... (rest of playwright setup) 
      
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      });
      const page = await context.newPage();

      // We need to execute the logic inside the browser page
      // The HTML string above is getting complicated.
      // Let's simplify: passing VFS via page.evaluate is cleaner than string injection.
      
      await page.setContent(html, { waitUntil: "networkidle" });
      
      // Inject VFS data safely
      await page.evaluate((data) => {
          (window as any).__VFS__ = data.vfs;
          (window as any).__ENTRY__ = data.entryPoint;
      }, { vfs, entryPoint });

      // Inject the loader script
      await page.addScriptTag({
        content: 
        `
        (function() {
            const modules = {};
            const libs = {
                "react": window.React,
                "react-dom/client": window.ReactDOM,
                "lucide-react": window.lucide,
                "framer-motion": window.Motion,
                "clsx": { clsx: window.clsx },
                "tailwind-merge": { twMerge: window.twMerge }
            };

            function require(path) {
                if (libs[path]) return libs[path];
                
                // Normalize path
                // Remove ./ and extension
                const clean = path.replace(/^\\.\\//, "").replace(/\\.[a-z]+$/, "");
                
                // Find matching file in VFS keys
                // Keys are like "src/components/Button.tsx"
                // Req is "components/Button"
                const match = Object.keys(window.__VFS__).find(k => {
                    const kClean = k.replace(/\\.[a-z]+$/, "");
                    return kClean.endsWith(clean);
                });
                
                if (match && modules[match]) return modules[match];
                
                console.warn("Module not found or not compiled:", path);
                return {};
            }

            // Compile Order: We need a smarter way than "loop once".
            // CommonJS factory pattern allows lazy eval.
            
            const registry = {}; // path -> factory function
            
            for (const [path, code] of Object.entries(window.__VFS__)) {
                if (path.endsWith(".css")) {
                    const style = document.createElement("style");
                    style.textContent = code;
                    document.head.appendChild(style);
                    continue;
                }
                
                try {
                    const res = Babel.transform(code, {
                        presets: ["react", "typescript", ["env", { modules: "commonjs" }]],
                        filename: path
                    });
                    
                    registry[path] = new Function("exports", "require", "module", "React", res.code);
                } catch(e) { console.error("Babel error", e); }
            }
            
            // Override require to execute factory if needed
            function requireDynamic(path) {
                if (libs[path]) return libs[path];
                 const clean = path.replace(/^\\.\\//, "").replace(/\\.[a-z]+$/, "");
                 const match = Object.keys(window.__VFS__).find(k => k.includes(clean)); // sloppy match
                 
                 if (!match) return {};
                 
                 if (modules[match]) return modules[match];
                 
                 if (registry[match]) {
                     const m = { exports: {} };
                     registry[match](m.exports, requireDynamic, m, window.React);
                     modules[match] = m.exports;
                     return m.exports;
                 }
                 return {};
            }

            // Run Entry
            const entry = window.__ENTRY__;
            if (registry[entry]) {
                const exports = requireDynamic("./" + entry); // simulate relative import
                if (exports.default) {
                     const root = ReactDOM.createRoot(document.getElementById('root'));
                     root.render(React.createElement(exports.default));
                }
            }
        })();
        `
      });

      // ... Rest of screenshot logic
      
      // Wait for rendering
      await page.waitForTimeout(2000);

      const viewports = [
        { name: "MOBILE", width: 375, height: 667 },
        { name: "TABLET", width: 768, height: 1024 },
        { name: "DESKTOP", width: 1440, height: 900 },
      ] as const;

      await prisma.previewAsset.deleteMany({
        where: { blockId: job.blockId },
      });

      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.waitForTimeout(500);

        const buffer = await page.screenshot({ type: "jpeg", quality: 80 });
        const objectKey = `previews/${job.blockId}/${vp.name.toLowerCase()}.jpeg`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: env.r2.bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: "image/jpeg",
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
            watermarked: false,
          },
        });
      }

      await prisma.renderJob.update({
        where: { id: jobId },
        data: { status: "SUCCEEDED", finishedAt: new Date() },
      });
    } catch (error: unknown) {
      console.error(`Render job ${jobId} failed:`, error);
      const message =
        error instanceof Error ? error.message : "Unknown error during rendering";
      await prisma.renderJob.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          error: message,
        },
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },
};