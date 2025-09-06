
export interface ImageFile {
  id: string;
  src: string; // base64
  name: string;
}

export interface ClothingItem extends ImageFile {
  x: number;
  y: number;
  width: number;
  height: number;
}
