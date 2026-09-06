export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/f_auto')) return url;
    // Insert f_auto,q_auto,w_{width} after /upload/
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

/**
 * U3: Lightweight blurred backdrop transform (~1KB) instead of reloading high-res image.
 */
export function getBackdropImageUrl(url: string): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('e_blur')) return url;
    if (url.includes('/upload/f_auto')) {
      // Replace existing optimization transform with backdrop blur transform
      return url.replace(/\/upload\/[^\/]+\//, '/upload/f_auto,q_30,w_40,e_blur:1000/');
    }
    return url.replace('/upload/', '/upload/f_auto,q_30,w_40,e_blur:1000/');
  }
  return url;
}
