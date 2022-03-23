import { FC } from "react";
import {
  FilterArgBool,
  FilterArgNumber,
  FilterArgPrimitive,
  FilterArgString,
} from "../config/filters";
import { Form, Input, Select, Slider, Switch } from "antd";
import { Option } from "rc-select";
import { getSliderMarks } from "./utils/getSliderMarks";
import { Label } from "./Label";

export const DynamicField: FC<{
  name: string | string[];
  label: string;
  config: FilterArgPrimitive;
  value: unknown;
  showHint?: boolean;
}> = ({ name, config, value, label: labelRaw, showHint = false }) => {
  const label = showHint ? <Label name={name as string} /> : labelRaw;

  if (typeof config.default === "boolean") {
    return (
      <Form.Item name={name} label={label}>
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
        <Form.Item name={name} label={label}>
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
      <Form.Item name={name} label={label}>
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
    const marks = getSliderMarks(min, max);
    return (
      <Form.Item name={name} label={label}>
        <Slider
          min={min}
          max={max}
          defaultValue={Number(value) ?? (config as FilterArgNumber).default}
          step={step}
          marks={marks}
        />
      </Form.Item>
    );
  }

  return null;
};
