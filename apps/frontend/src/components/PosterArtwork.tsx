import { useState } from "react";
import { resolveMediaUrl } from "../utils/media";

type PosterArtworkProps = {
  title: string;
  posterUrl?: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  titleClassName?: string;
};

export function PosterArtwork({
  title,
  posterUrl,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  titleClassName = "",
}: PosterArtworkProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveMediaUrl(posterUrl);
  const showImage = resolvedUrl !== "" && !hasError;

  return (
    <div className={className}>
      {showImage ? (
        <img
          src={resolvedUrl}
          alt={title}
          className={imageClassName}
          onError={() => setHasError(true)}
        />
      ) : null}
      {!showImage ? (
        <div className={fallbackClassName}>
          <span className={titleClassName}>{title}</span>
        </div>
      ) : null}
    </div>
  );
}
