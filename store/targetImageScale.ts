import { get, set } from "local-storage";

const TARGET_IMAGE_SCALE_KEY = "TARGET_IMAGE_SCALE";

export const getTargetImageScale = () =>
  get<number>(TARGET_IMAGE_SCALE_KEY) ?? 1;

export const saveTargetImageScale = (n: number) => {
  return set<number>(TARGET_IMAGE_SCALE_KEY, n);
};
