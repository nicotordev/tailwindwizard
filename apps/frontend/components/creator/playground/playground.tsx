"use client";

import type { ReactElement } from "react";
import React, { useState } from "react";
import Link from "next/link";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";

interface PlaygroundClientProps {
  onSave?: (file: File) => Promise<void>;
  onClose?: () => void;
  initialCode?: string;
}

function SandpackEditorContent({ onSave, onClose }: PlaygroundClientProps) {
  const { sandpack } = useSandpack();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const zip = new JSZip();
      const files = sandpack.files;

      Object.keys(files).forEach((path) => {
        const relativePath = path.startsWith("/") ? path.slice(1) : path;
        zip.file(relativePath, files[path].code);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const file = new File([blob], "block-bundle.zip", {
        type: "application/zip",
      });

      if (onSave) {
        await onSave(file);
      } else {
        toast.success("Bundle generated (Mock Save)");
      }
    } catch (error) {
      console.error("Failed to bundle files:", error);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[85vh] w-full">
      <div className="flex items-center justify-between px-1">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          {onClose ? "Close Editor" : "Back to Market"}
        </Button>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Bundling..." : "Save & Continue"}
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-xl overflow-hidden shadow-2xl bg-[#1e1e1e]">
        <SandpackLayout className="flex items-stretch h-full [&>*]:h-full!">
          <SandpackFileExplorer />
          <SandpackCodeEditor
            showTabs
            showLineNumbers
            showInlineErrors
            wrapContent
            closableTabs
            initMode="immediate"
            style={{ height: "100%" }}
          />
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={true}
            style={{ height: "100%" }}
          />
        </SandpackLayout>
      </div>
    </div>
  );
}

export default function PlaygroundClient({
  onSave,
  onClose,
  initialCode,
}: PlaygroundClientProps): ReactElement {
  const { theme } = useTheme();

  const defaultCode = `import React from "react";
import { LucideRocket } from "lucide-react";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <div className="font-sans grid place-items-center h-screen bg-zinc-950 text-white p-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
          <LucideRocket size={48} className="text-indigo-500" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          Tailwind Wizard
        </h1>
        
        <p className="text-zinc-400 max-w-md">
          This playground is running React, Tailwind CSS, and supports Shadcn UI patterns.
          Try editing this file to see changes instantly!
        </p>

        <div className="flex gap-4">
           <Button variant="default">Get Started</Button>
           <Button variant="secondary">Documentation</Button>
        </div>
      </div>
    </div>
  );
}
`;

  const utilsCode = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

  const buttonCode = `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100",
        secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        ghost: "hover:bg-zinc-800 hover:text-zinc-100",
        link: "text-indigo-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
`;

  return (
    <div className="w-full">
      <SandpackProvider
        template="react-ts"
        theme={theme === "light" ? "light" : "dark"}
        files={{
          "/App.tsx": initialCode || defaultCode,
          "/lib/utils.ts": utilsCode,
          "/components/ui/button.tsx": buttonCode,
        }}
        customSetup={{
          dependencies: {
            "lucide-react": "^0.300.0",
            "clsx": "^2.1.0",
            "tailwind-merge": "^2.2.1",
            "class-variance-authority": "^0.7.0",
            "@radix-ui/react-slot": "^1.0.2",
            "react-router-dom": "^6.22.3",
          },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
        }}
        className="h-full!"
      >
        <SandpackEditorContent onSave={onSave} onClose={onClose} />
      </SandpackProvider>
    </div>
  );
}