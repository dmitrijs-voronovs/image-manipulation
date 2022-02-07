export type ImageData = {
  src: string;
  name: string;
};
export const defaultImages: ImageData[] = Array.from({ length: 25 }).map(
  (_, i) => ({ src: `/${i < 10 ? "0" + i : i}.jpg`, name: `original-${i}` })
);