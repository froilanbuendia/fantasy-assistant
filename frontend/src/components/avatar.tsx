"use client";

import { useState } from "react";

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-xs",
};

export function Avatar({
  src,
  label,
  size = "md",
}: {
  src: string | null;
  label: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external CDN image, not worth Image host config for a small icon
      <img
        src={src}
        alt={label}
        className={`${sizeClass} shrink-0 rounded-full bg-zinc-200 object-cover dark:bg-zinc-800`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
