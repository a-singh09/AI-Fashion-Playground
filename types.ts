export interface ImageFile {
  id: string;
  src: string; // base64
  name: string;
}

export type ClothingCategory = 'Top' | 'Bottom' | 'Outerwear' | 'Shoes' | 'Accessory' | 'Dress' | 'Unknown';
export type ClothingSeason = 'Winter' | 'Spring' | 'Summer' | 'Autumn' | 'All-Season';
export type ClothingStyle = 'Casual' | 'Formal' | 'Sporty' | 'Business' | 'Evening' | 'Unknown';

export interface ClothingMetadata {
  category: ClothingCategory;
  color: string;
  season: ClothingSeason;
  style: ClothingStyle;
}

export interface WardrobeItem extends ImageFile {
  metadata?: ClothingMetadata;
  isAnalyzing?: boolean;
}
