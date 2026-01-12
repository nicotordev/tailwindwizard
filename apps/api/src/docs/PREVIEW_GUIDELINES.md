# Preview System Compatibility Guide

To ensure your components render correctly in the TailwindWizard preview system, please adhere to the following guidelines. The previewer runs your code in a sandboxed browser environment.

## 1. Supported Formats
- **Single File:** Upload a single `.tsx` or `.jsx` file.
- **Multi-File Project (ZIP):** Upload a `.zip` archive containing your component and its dependencies.

## 2. Multi-File Projects (ZIP)
If you upload a ZIP file, we support relative imports (e.g., `import Button from "./components/Button"`).
**Requirements:**
- **Entry Point:** Your project must contain one of the following files to be used as the rendering entry point:
  - `App.tsx`
  - `src/App.tsx`
  - `index.tsx`
  - `src/index.tsx`
- **File Types:** We support `.tsx`, `.ts`, `.jsx`, `.js`, and `.css`.

## 3. Supported Dependencies
The following libraries are pre-loaded and available for import. **Do not** attempt to install or import other external packages, as they will fail to resolve.

| Package | Version | Import Example |
| :--- | :--- | :--- |
| `react` | 18.2.0 | `import React, { useState } from "react";` |
| `react-dom` | 18.2.0 | *(Implicitly used)* |
| `lucide-react` | 0.294.0 | `import { User, Bell } from "lucide-react";` |
| `framer-motion` | 10.16.4 | `import { motion } from "framer-motion";` |
| `clsx` | 2.0.0 | `import { clsx } from "clsx";` |
| `tailwind-merge` | 2.1.0 | `import { twMerge } from "tailwind-merge";` |

## 4. Code Structure
- **Default Export:** The entry point file **must** have a default export which is the React component to be rendered.
  ```tsx
  // App.tsx
  import Button from "./components/Button";
  
  export default function MyPage() { 
    return <Button>Click me</Button>;
  }
  ```
- **Styling:** 
  - **Tailwind CSS:** Full support via CDN.
  - **CSS Files:** You can import `.css` files (e.g., `import "./styles.css"`), and they will be injected into the document head.
  - **Variables:** Standard shadcn/ui variables are available.

## 5. Limitations
- **No Node.js APIs:** You cannot use `fs`, `path`, or `process`.
- **Images:** Use external public URLs for images. Local image assets in the ZIP are not yet served in the sandbox.
