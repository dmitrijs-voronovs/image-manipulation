import { FC } from "react";
import {
  FilterArgPrimitive,
  FilterArgBool,
  FilterArgNumber,
  FilterArgString,
} from "../config/filters";
import { Form, Input, Slider, Switch } from "antd";
import { filterArgConfig } from "../config/filterArgConfig";

export const DynamicField: FC<{
  name: string;
  config: FilterArgPrimitive;
  value: unknown;
}> = ({ name, config, value }) => {
  const argConfig = filterArgConfig[name];
  if (typeof config.default === "boolean") {
    return (
      <Form.Item name={name} label={name} required={true}>
        <Switch
          defaultChecked={
            typeof value !== "undefined"
              ? Boolean(value)
              : (argConfig as FilterArgBool).default
          }
        />
      </Form.Item>
    );
  }

  if (typeof config.default === "string") {
    return (
      <Form.Item name={name} label={name} required={true}>
        <Input
          type={"color"}
          defaultValue={String(value) || (argConfig as FilterArgString).default}
        />
      </Form.Item>
    );
  }

  if (typeof config.default === "number") {
    const max = (argConfig as FilterArgNumber).max;
    const min = (argConfig as FilterArgNumber).min;
    const step = max / 100;
    // const marks = Array.from({length: max / 10}).map((a,i) => {
    //
    // })
    const total = min > max ? min - max : max - min;
    const markCount = 5;
    const markStep = total / markCount;
    const marks = Array.from({ length: markCount - 1 }).reduce<
      Record<string, string>
    >((acc, _, i) => {
      const relativeMarker = markStep * (i + 1);
      const marker = min < 0 ? relativeMarker + min : relativeMarker - min;
      acc[marker] = String(marker);
      return acc;
    }, {});
    return (
      <Form.Item name={name} label={name}>
        <Slider
          min={min}
          max={max}
          defaultValue={Number(value) || (argConfig as FilterArgNumber).default}
          step={step}
          marks={marks}
        />
      </Form.Item>
    );
  }

  return null;
};
