/**
 * Centralized image cache to prevent duplicate image loading
 * and ensure all instances share the same image objects
 */
class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, HTMLImageElement> = new Map();

  private constructor() {}

  static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  getImage(src: string): HTMLImageElement {
    if (!this.cache.has(src)) {
      const img = new Image();
      img.src = src;
      this.cache.set(src, img);
    }
    return this.cache.get(src)!;
  }

  preloadImages(sources: string[]): Promise<void[]> {
    const promises = sources.map((src) => {
      return new Promise<void>((resolve, reject) => {
        if (this.cache.has(src)) {
          resolve();
          return;
        }

        const img = new Image();
        img.onload = () => {
          this.cache.set(src, img);
          resolve();
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
      });
    });

    return Promise.all(promises);
  }
}

export default ImageCache;
