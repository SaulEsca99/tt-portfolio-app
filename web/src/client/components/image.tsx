"use client";
import { buildSrc, Image as ImageKit, type IKImageProps } from "@imagekit/next";
import { useState } from "react";

export function Image({ src, ...props }: IKImageProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  return (
    <ImageKit
      {...props}
      src={src}
      alt="Next.js logo"
      loading="eager"
      style={
        showPlaceholder
          ? {
              backgroundImage: `url(${buildSrc({
                src,
                urlEndpoint: "https://ik.imagekit.io/tnwperzsv",
                transformation: [
                  {
                    quality: 10,
                    blur: 90,
                  },
                ],
              })})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : {}
      }
      onLoad={() => {
        setShowPlaceholder(false);
      }}
    />
  );
}
