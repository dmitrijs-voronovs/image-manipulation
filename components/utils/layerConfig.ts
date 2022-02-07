import { defaultUserValue } from "../../config/filterArgConfig";

export const BASE_LAYER_IDX = 0;
export const DEFAULT_N_OF_ADDITIONAL_LAYERS = 1;

export const getInitialUserConfig = (n: number, includeBaseLayer = true) =>
  Array.from({
    length: (includeBaseLayer ? 1 : 0) + n,
  }).map((_) => defaultUserValue);
