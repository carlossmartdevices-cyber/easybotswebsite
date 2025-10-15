import placeholderImages from './placeholder-images.json';

export function getProductImage(imageKey: string): string {
  return placeholderImages[imageKey as keyof typeof placeholderImages] || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop';
}
