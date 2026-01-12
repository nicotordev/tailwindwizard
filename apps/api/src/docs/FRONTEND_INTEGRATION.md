# Frontend Integration Guide: Preview System

This guide explains how to integrate the TailwindWizard Preview System into the frontend application. The system follows an asynchronous **Upload -> Trigger -> Poll** workflow.

## 1. Upload Code Bundle
Creators can upload either a single `.tsx`/`.jsx` file or a `.zip` archive for multi-file projects.

- **Endpoint:** `POST /api/blocks/:id/bundle`
- **Auth:** Required (Creator or Admin)
- **Body:** `multipart/form-data`
- **Field Name:** `bundle`

```typescript
const uploadBundle = async (blockId: string, file: File) => {
  const formData = new FormData();
  formData.append('bundle', file);

  const res = await fetch(`/api/blocks/${blockId}/bundle`, {
    method: 'POST',
    body: formData,
  });
  
  return res.json(); // { id, sha256, size, fileName }
};
```

## 2. Queue Preview Render
Once the code is uploaded, trigger the background rendering process.

- **Endpoint:** `POST /api/blocks/:id/preview`
- **Auth:** Required (Creator or Admin)

```typescript
const queuePreview = async (blockId: string) => {
  const res = await fetch(`/api/blocks/${blockId}/preview`, {
    method: 'POST',
  });
  
  if (!res.ok) throw new Error('Failed to queue preview');
  return res.json(); // { id: "job_id", status: "QUEUED", ... }
};
```

## 3. Poll for Completion
Since rendering happens in a headless browser, you must poll the job status until it succeeds.

- **Endpoint:** `GET /api/blocks/render-jobs/:jobId`
- **Auth:** Public

```typescript
const pollRenderStatus = async (jobId: string) => {
  const res = await fetch(`/api/blocks/render-jobs/${jobId}`);
  const job = await res.json();

  if (job.status === 'SUCCEEDED') return { success: true };
  if (job.status === 'FAILED') return { success: false, error: job.error };
  
  // Wait 2 seconds and retry
  await new Promise(resolve => setTimeout(resolve, 2000));
  return pollRenderStatus(jobId);
};
```

## 4. Fetch and Display Previews
When the job is successful, the block details will contain the public URLs for the generated screenshots.

- **Endpoint:** `GET /api/blocks/:id`

```typescript
const getBlockWithPreviews = async (blockId: string) => {
  const res = await fetch(`/api/blocks/${blockId}`);
  const block = await res.json();
  
  // Previews are stored in block.previews array
  // Example: [{ viewport: "DESKTOP", url: "..." }, ...]
  return block;
};
```

---

## Technical Notes

### Multi-file Support (ZIP)
- If a ZIP is uploaded, the system automatically extracts it.
- **Entry Point:** The system looks for `App.tsx`, `src/App.tsx`, `index.tsx`, or `src/index.tsx`.
- **Imports:** Relative imports (e.g., `import Nav from "./Nav"`) are supported.
- **CSS:** Any `.css` file in the ZIP will be automatically injected.

### Browser Environment
The previewer runs in a sandboxed environment with:
- **Tailwind CSS** (v3 CDN)
- **React** (v18.2)
- **Lucide-React**
- **Framer Motion**
- **shadcn/ui CSS Variables** pre-configured in the root.

### Error Handling
If a render fails, the `error` field in the `RenderJob` will contain the Babel compilation error or Playwright timeout details. Always display this to the creator so they can fix their code.
