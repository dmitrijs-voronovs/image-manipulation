import { FC, useEffect, useState } from "react";
import {
  getTargetImageScale,
  saveTargetImageScale,
} from "../store/targetImageScale";
import { Slider } from "antd";
import { getSliderMarks } from "./utils/getSliderMarks";

const min = 0;
const max = 4;
const marks = getSliderMarks(min, max, 8);

type ImageScaleSliderProps = { onAfterChange?: (val: number) => void };

export const ImageScaleSlider: FC<ImageScaleSliderProps> = ({
  onAfterChange,
}) => {
  const [value, setValue] = useState(1);
  useEffect(() => {
    const scale = getTargetImageScale();
    setValue(scale);
  }, []);

  return (
    <Slider
      min={min}
      max={max}
      marks={marks}
      step={0.05}
      value={value}
      onChange={(v) => setValue(v)}
      onAfterChange={(v) => {
        saveTargetImageScale(v);
        onAfterChange && onAfterChange(Number(v));
      }}
    />
  );
};
