// src/lib/lruAvatarCache.ts

import { LRUCache } from "lru-cache";

// --- LRU Cache Configuration ---
// We configure the cache to hold a maximum of 100 items (max).
const options = {
  max: 100,
};

// Created a new LRU cache instance that will store avatar URLs (string)
// and their corresponding base64 data (string).
const avatarCache = new LRUCache<string, string>(options);

// Fetches an image from a URL, converts it to a base64 string, and stores it in the LRU cache.
const fetchAndCacheAvatar = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Necessary for fetching images from other domains

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return reject(new Error("Could not get canvas context"));
      }

      ctx.drawImage(img, 0, 0);

      // Convert the canvas content to a base64 string
      const base64String = canvas.toDataURL("image/png");

      // Add the new image to the LRU cache.
      // If the cache is full, the least recently used item will be automatically evicted.
      avatarCache.set(url, base64String);

      resolve(base64String);
    };

    img.onerror = () => {
      reject(new Error(`Failed to load image for caching: ${url}`));
    };

    img.src = url;
  });
};

export { avatarCache, fetchAndCacheAvatar };
