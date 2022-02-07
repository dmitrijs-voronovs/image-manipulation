import { FilterArgConfig, LayerFilters, MainFilters } from "../config/filters";

type FilterFunctions = {
  [Key in keyof MainFilters]: Function;
};
type LayerFilterFunctions = {
  [Key in keyof LayerFilters]: Function;
};
// type AdditionalLayerFunctions
export type CamanInstanceLayer = Omit<CamanInstance, keyof FilterFunctions> &
  LayerFilterFunctions & {
    filter: FilterFunctions;
  };

export type CamanInstance = FilterFunctions & {
  reset: Function;
  render(cb?: Function): void;
  newLayer(cb?: (this: CamanInstanceLayer) => void): void;
};
export type Caman = {
  (
    imgId: string | HTMLImageElement | HTMLCanvasElement,
    init: (this: CamanInstance) => void
  ): CamanInstance;
  (
    canvasId: string | HTMLImageElement | HTMLCanvasElement,
    src: string,
    init: (this: CamanInstance) => void
  ): CamanInstance;
};
declare global {
  interface Window {
    Caman?: Caman;
  }
}
