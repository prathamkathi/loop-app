export function getOptimizedImageUrl(url: string, width: number = 800): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) {
    // Insert f_auto,q_auto,w_{width} after /upload/
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}
