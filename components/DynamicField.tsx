import { FC } from "react";
import {
  FilterArgPrimitive,
  FilterArgBool,
  FilterArgNumber,
  FilterArgString,
} from "../config/filters";
import { Form, Input, Select, Slider, Switch } from "antd";
import { filterArgConfig } from "../config/filterArgConfig";
import { Option } from "rc-select";

export const DynamicField: FC<{
  name: string | string[];
  label: string;
  config: FilterArgPrimitive;
  value: unknown;
}> = ({ name, config, value, label }) => {
  // const config = filterArgConfig[label];
  if (typeof config.default === "boolean") {
    return (
      <Form.Item name={name} label={label} required={true}>
        <Switch
          defaultChecked={
            typeof value !== "undefined"
              ? Boolean(value)
              : (config as FilterArgBool).default
          }
        />
      </Form.Item>
    );
  }

  if (typeof config.default === "string") {
    if ((config as FilterArgString).options) {
      return (
        <Form.Item name={name} label={label} required={true}>
          <Select
            defaultValue={
              value ? String(value) : (config as FilterArgString).default
            }
          >
            {((config as FilterArgString).options || []).map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        </Form.Item>
      );
    }

    return (
      <Form.Item name={name} label={label} required={true}>
        <Input
          type={"color"}
          defaultValue={String(value) || (config as FilterArgString).default}
        />
      </Form.Item>
    );
  }

  if (typeof config.default === "number") {
    const max = (config as FilterArgNumber).max;
    const min = (config as FilterArgNumber).min;
    const step = (config as FilterArgNumber).step || max / 100;
    // const marks = Array.from({length: max / 10}).map((a,i) => {
    //
    // })
    const total = min > max ? min - max : max - min;
    const markCount = 10;
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
      <Form.Item name={name} label={label}>
        <Slider
          min={min}
          max={max}
          defaultValue={Number(value) || (config as FilterArgNumber).default}
          step={step}
          marks={marks}
        />
      </Form.Item>
    );
  }

  return null;
};
