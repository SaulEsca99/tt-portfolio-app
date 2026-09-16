/* eslint-disable @next/next/no-img-element */
import { Button } from "@/client/components/ui/button";
import { cn } from "@/client/lib/utils";
import { ImagePlus, X } from "lucide-react";
import * as React from "react";

interface ImageUploaderContextValue {
  previewUrl: string | null;
  isInvalid?: boolean;
  onRemove: () => void;
  onUploadClick: () => void;
}

const ImageUploaderContext =
  React.createContext<ImageUploaderContextValue | null>(null);

function useImageUploaderContext() {
  const context = React.useContext(ImageUploaderContext);
  if (!context) {
    throw new Error(
      "ImageUploader components must be used within ImageUploader"
    );
  }
  return context;
}

interface ImageUploaderProps {
  children: React.ReactNode;
  previewUrl: string | null;
  isInvalid?: boolean;
  onRemove: () => void;
  onUploadClick: () => void;
  className?: string;
}

function ImageUploader({
  children,
  previewUrl,
  isInvalid,
  onRemove,
  onUploadClick,
  className,
}: ImageUploaderProps) {
  return (
    <ImageUploaderContext.Provider
      value={{ previewUrl, isInvalid, onRemove, onUploadClick }}
    >
      <div className={cn("space-y-2", className)}>{children}</div>
    </ImageUploaderContext.Provider>
  );
}

// Componente del área de subida
interface ImageUploaderAreaProps {
  children?: React.ReactNode;
  className?: string;
}

function ImageUploaderArea({ children, className }: ImageUploaderAreaProps) {
  const { previewUrl, isInvalid, onUploadClick } = useImageUploaderContext();

  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden bg-muted/30 hover:bg-muted/50",
        isInvalid ? "border-destructive/50" : "border-border",
        previewUrl
          ? "border-solid border-border bg-background"
          : "flex flex-col items-center justify-center cursor-pointer",
        className
      )}
      onClick={!previewUrl ? onUploadClick : undefined}
    >
      {children}
    </div>
  );
}

// Componente de preview
interface ImageUploaderPreviewProps {
  alt?: string;
}

function ImageUploaderPreview({ alt = "Preview" }: ImageUploaderPreviewProps) {
  const { previewUrl, onRemove } = useImageUploaderContext();

  if (!previewUrl) return null;

  return (
    <>
      <img
        src={previewUrl}
        alt={alt}
        className="size-full object-cover animate-in fade-in zoom-in-95 duration-300"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </>
  );
}

interface ImageUploaderEmptyProps {
  title?: string;
  description?: string;
}

function ImageUploaderEmpty({
  title = "Sube una foto",
  description = "o arrastra aquí",
}: ImageUploaderEmptyProps) {
  const { previewUrl } = useImageUploaderContext();

  if (previewUrl) return null;

  return (
    <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
      <div className="p-3 bg-background rounded-full shadow-sm">
        <ImagePlus className="w-6 h-6" />
      </div>
      <div className="text-xs">
        <span className="font-semibold text-primary">{title}</span>{" "}
        {description}
        <p className="opacity-70 mt-1">JPG, PNG (Máx 5MB)</p>
      </div>
    </div>
  );
}

interface ImageUploaderInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  accept?: string;
}

function ImageUploaderInput({
  inputRef,
  onChange,
  onBlur,
  accept = "image/png, image/jpeg, image/webp",
}: ImageUploaderInputProps) {
  return (
    <input
      type="file"
      ref={inputRef}
      className="hidden"
      accept={accept}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}

export {
  ImageUploader,
  ImageUploaderArea,
  ImageUploaderEmpty,
  ImageUploaderInput,
  ImageUploaderPreview,
};
