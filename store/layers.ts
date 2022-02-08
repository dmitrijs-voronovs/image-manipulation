import { get, set } from "local-storage";

const LAYERS_NUMBER_KEY = "LAYERS_NUMBER";

export const getNumberOfLayers = () => get<number>(LAYERS_NUMBER_KEY) ?? 1;

export const saveNumberOfLayers = (n: number) => {
  return set<number>(LAYERS_NUMBER_KEY, n);
};
