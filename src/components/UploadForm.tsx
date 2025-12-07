"use client";

import { useState, useTransition } from "react";
import { processAndSaveDocument } from "@/app/actions";

export function UploadForm() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setStatus("idle");
    setMessage("");

    startTransition(async () => {
      const result = await processAndSaveDocument(formData);

      if (result.success) {
        setStatus("success");
        setMessage("Document processed and saved successfully!");
      } else {
        setStatus("error");
        setMessage(`Error: ${result.error}`);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-w-md"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="file"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Upload Document for OCR
        </label>
        <input
          type="file"
          name="file"
          id="file"
          accept=".pdf,.png,.jpg,.jpeg,.tiff"
          required
          className="block w-full text-sm text-zinc-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
            dark:file:bg-zinc-800 dark:file:text-zinc-200
            dark:hover:file:bg-zinc-700"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Processing..." : "Upload & Process"}
      </button>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            status === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
