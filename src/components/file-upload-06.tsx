"use client";

import { CheckCircle, FileText, Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "completed";
}

const MAX_FILE_SIZE = 1 * 1024 * 1024;

export default function FileUpload06() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    filePickerRef.current?.click();
  };

  const onFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const onDropFiles = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const removeUploadById = (id: string) => {
    setUploads(uploads.filter((file) => file.id !== id));
  };

  const activeUploads = uploads.filter((file) => file.status === "uploading");
  const completedUploads = uploads.filter(
    (file) => file.status === "completed",
  );

  const handleFileUpload = (files: FileList) => {
    const fileList = Array.from(files);

    fileList.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        console.error(`File ${file.name} is larger than 1MB.`);
        alert(`File ${file.name} is larger than 1MB.`);
        return;
      }
      const uploadId = Math.random().toString(36).substring(2, 9);

      const newUpload: UploadItem = {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: "uploading",
      };

      setUploads((prev) => [...prev, newUpload]);
      uploadFileWithProgress(file, uploadId);
    });
  };

  const uploadFileWithProgress = (file: File, id: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);

        setUploads((prevUpload) =>
          prevUpload.map((item) =>
            item.id === id ? { ...item, progress: percentage } : item,
          ),
        );
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const responseData = JSON.parse(xhr.responseText);

        setUploads((prevUpload) =>
          prevUpload.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress: 100,
                  status: "completed",
                }
              : item,
          ),
        );

        sessionStorage.setItem("pdf_text", responseData.text);
      } else {
        console.error("Upload failed with status: ", xhr.status);
      }
    });

    xhr.addEventListener("error", () => {
      console.error("Upload error occurred.");
    });

    xhr.open("POST", "/api/extract-pdf");
    xhr.send(formData);
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-y-6">
      <Card
        className="group flex max-h-50 w-full cursor-pointer flex-col items-center justify-center gap-4 border-dashed py-8 text-sm shadow-none transition-colors hover:bg-muted/50"
        onClick={openFilePicker}
        onDragOver={onDragOver}
        onDrop={onDropFiles}
      >
        <div className="grid space-y-3">
          <div className="flex items-center gap-x-2 text-muted-foreground">
            <Upload className="size-5" />
            <div>
              Drop files here or{" "}
              <Button
                className="h-auto p-0 font-normal text-primary"
                onClick={openFilePicker}
                variant="link"
              >
                browse files
              </Button>{" "}
              to add
            </div>
          </div>
        </div>
        <input
          multiple
          accept="application/pdf"
          className="hidden"
          onChange={onFileInputChange}
          ref={filePickerRef}
          type="file"
        />
        <span className="mt-2 block text-base/6 text-muted-foreground group-disabled:opacity-50 sm:text-xs">
          Supported: PDF (max 10 MB)
        </span>
      </Card>

      <div className="flex flex-col gap-y-4">
        {activeUploads.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-balance font-mono font-normal text-foreground text-lg uppercase sm:text-xs">
              <Loader2 className="mr-1 size-4 animate-spin" />
              Uploading
            </h2>
            <div className="-mt-2 divide-y">
              {activeUploads.map((file) => (
                <div className="group flex items-center py-4" key={file.id}>
                  <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                    <FileText className="inline size-4 group-hover:hidden" />
                    <Button
                      aria-label="Cancel"
                      className="hidden size-4 h-auto p-0 group-hover:inline"
                      onClick={() => removeUploadById(file.id)}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                  <div className="mb-1 flex w-full flex-col">
                    <div className="flex justify-between gap-2">
                      <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground text-sm tabular-nums">
                        {file.progress}%
                      </span>
                    </div>
                    <Progress
                      className="mt-1 h-2 min-w-64"
                      value={file.progress}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeUploads.length > 0 && completedUploads.length > 0 && (
          <Separator className="my-0" />
        )}

        {completedUploads.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-balance font-mono font-normal text-foreground text-lg uppercase sm:text-xs">
              <CheckCircle className="mr-1 size-4" />
              Finished
            </h2>
            <div className="-mt-2 divide-y">
              {completedUploads.map((file) => (
                <div key={file.id}>
                  <div className="group flex items-center py-4">
                    <div className="mr-3 grid size-10 shrink-0 place-content-center rounded border bg-muted">
                      <FileText className="inline size-4 group-hover:hidden" />
                      <Button
                        aria-label="Remove"
                        className="hidden size-4 h-auto p-0 group-hover:inline cursor-pointer"
                        onClick={() => removeUploadById(file.id)}
                        size="icon"
                        variant="ghost"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="mb-1 flex w-full flex-col">
                      <div className="flex justify-between gap-2">
                        <span className="select-none text-base/6 text-foreground group-disabled:opacity-50 sm:text-sm/6">
                          {file.name}
                        </span>
                        <span className="text-muted-foreground text-sm tabular-nums">
                          {file.progress}%
                        </span>
                      </div>
                      <Progress
                        className="mt-1 h-2 min-w-64"
                        value={file.progress}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/summary/${file.id}`}
                    className="bg-neutral-50 text-neutral-950 px-4 py-2 text-sm"
                  >
                    Generate Summary
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
