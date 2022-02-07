import {
  FilterArgConfig,
  FilterArgNumber,
  FilterArgSwitch,
  LayerFilters,
  MainFilters,
  SWITCH_ARG_LABEL,
  TransformationFilters,
} from "./filters";
import { ValueConfig } from "./valueConfig";

const delta200 = (label?: FilterArgNumber["label"]): FilterArgNumber => ({
  min: -100,
  max: 100,
  default: 0,
  label,
});
const delta100 = (label?: FilterArgNumber["label"]): FilterArgNumber => ({
  min: 0,
  max: 100,
  default: 0,
  label,
});
const falseSwitch: FilterArgSwitch = {
  default: false,
  label: SWITCH_ARG_LABEL,
};
const degrees = {
  min: 0,
  max: 360,
  default: 0,
  label: "degrees",
};

// placeholder
export const filterArgTransformConfig: TransformationFilters = {
  resize: [
    falseSwitch,
    [
      [
        {
          min: 0,
          max: 2000,
          label: "width",
          default: 0,
        },
        {
          min: 0,
          max: 2000,
          label: "height",
          default: 0,
        },
      ],
    ],
  ],
  rotate: [falseSwitch, [degrees]],
  crop: [
    falseSwitch,
    [
      [
        {
          min: 0,
          max: 2000,
          label: "width",
          default: 0,
        },
        {
          min: 0,
          max: 2000,
          label: "height",
          default: 0,
        },
        {
          min: 0,
          max: 2000,
          label: "x",
          default: 0,
        },
        {
          min: 0,
          max: 2000,
          label: "y",
          default: 0,
        },
      ],
    ],
  ],
};

export const filterArgMainConfig: MainFilters = {
  brightness: delta200(),
  clip: delta100(),
  contrast: delta200(),
  exposure: delta200(),
  gamma: {
    min: 0,
    max: 5,
    default: 1,
  },
  noise: {
    min: 0,
    max: 300,
    default: 0,
  }, // TODO: add filter arg
  saturation: delta200(),
  sepia: delta100(),
  vibrance: delta200(),
  sharpen: delta100(),
  hue: delta100(),
  colorize: [{ default: "#ffffff", label: "color" }, delta100("value")],
  channels: {
    red: delta200(),
    green: delta200(),
    blue: delta200(),
  },
  greyscale: { default: false },
  invert: { default: false },
  stackBlur: {
    min: 0,
    max: 50,
    default: 0,
  },
  boxBlur: { default: false },
  heavyRadialBlur: { default: false },
  gaussianBlur: { default: false },
  motionBlur: [falseSwitch, [degrees]],
  vignette: [
    { min: 0, max: 1000, default: 0, label: "size" },
    { min: 0, max: 1000, default: 0, label: "strength" },
  ],
  posterize: [
    falseSwitch,
    [
      {
        min: 0,
        max: 255,
        default: 0,
        step: 1,
      },
    ],
  ],
  threshold: [falseSwitch, [delta100("value")]],
  edgeEnhance: { default: false },
  edgeDetect: { default: false },
  emboss: { default: false },
};

export const filterArgLayerConfig: LayerFilters = {
  fillColor: [falseSwitch, [{ default: "#ffffff" }]],
  setBlendingMode: {
    default: "normal",
    options: [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "difference",
      "addition",
      "exclusion",
      "softLight",
      "lighten",
      "darken",
    ],
  },
  opacity: delta100(),
};

// TODO: remove???
export const filterArgConfig: FilterArgConfig = {
  ...filterArgMainConfig,
  ...filterArgLayerConfig,
};

export const defaultUserValue: Partial<ValueConfig> = {};
