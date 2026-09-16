"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { Loader2 } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { FieldContent, FieldError, FieldLabel } from "../ui/field";
import {
  ImageUploader,
  ImageUploaderArea,
  ImageUploaderEmpty,
  ImageUploaderInput,
  ImageUploaderPreview,
} from "../ui/image-uploader";
import { useFieldContext } from "./form-context";

interface FormImageKitUploaderProps {
  label: string;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  previewAlt?: string;
  folder?: string;
  onUploadComplete?: (url?: string) => void;
  onUploadError?: (error: Error) => void;
}

export function FormImageKitUploader({
  label,
  className,
  emptyTitle,
  emptyDescription,
  previewAlt,
  folder,
  onUploadComplete,
  onUploadError,
}: FormImageKitUploaderProps) {
  const field = useFieldContext<string | null | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const previewUrl = field.state.value || null;

  const authenticator = async () => {
    try {
      const response = await fetch("/api/upload-auth");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Request failed with status ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();
      const { signature, expire, token, publicKey } = data;
      return { signature, expire, token, publicKey };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Authentication request failed");
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Crear nuevo AbortController para esta subida
    abortControllerRef.current = new AbortController();

    try {
      const authParams = await authenticator();
      const { signature, expire, token, publicKey } = authParams;

      const uploadResponse = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        folder: folder,
        onProgress: (event) => {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        },
        abortSignal: abortControllerRef.current.signal,
      });

      field.handleChange(uploadResponse.url);

      onUploadComplete?.(uploadResponse.url);

      // console.log("Upload successful:", uploadResponse);
    } catch (error) {
      let errorMessage = "Error al subir la imagen";

      if (error instanceof ImageKitAbortError) {
        errorMessage = "Subida cancelada";
        console.error("Upload aborted:", error.reason);
      } else if (error instanceof ImageKitInvalidRequestError) {
        errorMessage = "Solicitud inválida";
        console.error("Invalid request:", error.message);
      } else if (error instanceof ImageKitUploadNetworkError) {
        errorMessage = "Error de red";
        console.error("Network error:", error.message);
      } else if (error instanceof ImageKitServerError) {
        errorMessage = "Error del servidor";
        console.error("Server error:", error.message);
      } else {
        console.error("Upload error:", error);
      }

      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));

      field.handleChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  const handleRemove = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    field.handleChange(null);
    setUploadProgress(0);
    setIsUploading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const isInvalid =
    field.state.meta.isTouched && field.state.meta.errors.length > 0;

  return (
    <FieldContent data-invalid={isInvalid} className={className}>
      <FieldLabel className="text-sm font-medium">{label}</FieldLabel>

      <ImageUploader
        previewUrl={previewUrl}
        isInvalid={isInvalid}
        onRemove={handleRemove}
        onUploadClick={triggerUpload}
      >
        <ImageUploaderArea>
          <ImageUploaderPreview alt={previewAlt} />
          <ImageUploaderEmpty
            title={emptyTitle}
            description={emptyDescription}
          />

          {isUploading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-sm font-medium">
                Subiendo... {Math.round(uploadProgress)}%
              </div>
              <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </ImageUploaderArea>

        <ImageUploaderInput
          inputRef={inputRef}
          onChange={handleFileChange}
          onBlur={field.handleBlur}
        />
      </ImageUploader>

      {isInvalid && (
        <FieldError
          errors={field.state.meta.errors}
          className="text-destructive text-xs"
        />
      )}
    </FieldContent>
  );
}
