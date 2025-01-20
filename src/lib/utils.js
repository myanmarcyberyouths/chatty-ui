import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isImageFile(content) {
    const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    return imageRegex.test(content);
}
