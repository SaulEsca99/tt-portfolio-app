"use client";

import NextImage, { type ImageProps } from "next/image";

// Wrapper simple sobre next/image — ImageKit fue eliminado del proyecto
export function Image(props: ImageProps) {
  return <NextImage {...props} />;
}
