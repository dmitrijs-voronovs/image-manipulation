export type FilterArgBase = {
  label?: string;
  default: any;
};

export type FilterArgSteppable = {
  step?: number;
};

export type FilterArgNumber = FilterArgBase &
  FilterArgSteppable & {
    min: number;
    max: number;
    default: number;
  };
export type FilterArgString = FilterArgBase & {
  default: string;
  options?: string[];
};
export type FilterArgBool = FilterArgBase & { default: boolean };

export const SWITCH_ARG_LABEL = "applied";
export type FilterArgSwitch = FilterArgBool &
  FilterArgBase & { label: "applied" };
export type FilterArgPrimitive =
  | FilterArgNumber
  | FilterArgString
  | FilterArgBool;
export type FilterArgComplex =
  | FilterArgPrimitive[]
  | Record<string, FilterArgPrimitive>;
export type BaseFilterArgs = FilterArgPrimitive | FilterArgComplex;
export type WithSwitch<T extends BaseFilterArgs> = [FilterArgSwitch, [T]];
export type FilterArgs = BaseFilterArgs | WithSwitch<BaseFilterArgs>;
export type FilterConfiguration = Record<string, FilterArgs>;

export interface MainFilters extends FilterConfiguration {
  brightness: FilterArgNumber;
  channels: {
    red: FilterArgNumber;
    green: FilterArgNumber;
    blue: FilterArgNumber;
  };
  clip: FilterArgNumber;
  colorize: [FilterArgString, FilterArgNumber];
  contrast: FilterArgNumber;
  exposure: FilterArgNumber;
  gamma: FilterArgNumber;
  greyscale: FilterArgBool;
  hue: FilterArgNumber;
  invert: FilterArgBool;
  noise: FilterArgNumber;
  saturation: FilterArgNumber;
  sepia: FilterArgNumber;
  vibrance: FilterArgNumber;
  stackBlur: FilterArgNumber;
  boxBlur: FilterArgBool;
  heavyRadialBlur: FilterArgBool;
  gaussianBlur: FilterArgBool;
  motionBlur: WithSwitch<FilterArgNumber>;
  sharpen: FilterArgNumber;
  vignette: [FilterArgNumber, FilterArgNumber];
  // TODO: maybe add?
  // rectangularVignette: [FilterArgNumber,FilterArgNumber, ]
  // tiltShift: [{
  //     center: {
  //
  //     }
  // }]
  // radialBlur
  edgeEnhance: FilterArgBool;
  edgeDetect: FilterArgBool;
  emboss: FilterArgBool;
  posterize: WithSwitch<FilterArgNumber>;
  threshold: WithSwitch<FilterArgNumber>;
}

export interface TransformationFilters extends FilterConfiguration {
  crop: WithSwitch<
    [FilterArgNumber, FilterArgNumber, FilterArgNumber, FilterArgNumber]
  >;
  resize: WithSwitch<[FilterArgNumber, FilterArgNumber]>;
  rotate: WithSwitch<FilterArgNumber>;
}

export interface LayerFilters extends FilterConfiguration {
  setBlendingMode: FilterArgString;
  opacity: FilterArgNumber;
  fillColor: WithSwitch<FilterArgString>;
}

// export interface FilterArgConfig extends MainFilters, TransformationFilters {}
export interface FilterArgConfig extends MainFilters, LayerFilters {}
