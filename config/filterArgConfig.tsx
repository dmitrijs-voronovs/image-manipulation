import {
  FilterArgConfig,
  FilterArgNumber,
  FilterArgSwitch,
  SWITCH_ARG_LABEL,
} from "./filters";

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
export const filterArgConfig: FilterArgConfig = {
  brightness: delta200(),
  channels: {
    red: delta200(),
    green: delta200(),
    blue: delta200(),
  },
  clip: delta100(),
  colorize: [{ default: "#ffffff", label: "color" }, delta100("value")],
  contrast: delta200(),
  exposure: delta200(), // TODO: add filter arg
  fillColor: [falseSwitch, [{ default: "#ffffff" }]],
  gamma: {
    min: 0,
    max: 5,
    default: 1,
  },
  greyscale: { default: false },
  hue: delta100(),
  invert: { default: false },
  noise: {
    min: 0,
    max: 100,
    default: 0,
  },
  saturation: delta200(),
  sepia: delta100(),
  vibrance: delta200(),
  stackBlur: {
    min: 0,
    max: 50,
    default: 0,
  },
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
  boxBlur: { default: false },
  heavyRadialBlur: { default: false },
  gaussianBlur: { default: false },
  motionBlur: [falseSwitch, [degrees]],
  sharpen: delta100(),
  vignette: [delta100("size"), delta100("strength")],
  edgeEnhance: { default: false },
  edgeDetect: { default: false },
  emboss: { default: false },
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
  threshold: [falseSwitch, [delta200("value")]],
  rotate: [falseSwitch, [degrees]],
};
