import { FC } from "react";
import { ValueConfig } from "../config/valueConfig";
import { filterArgConfig } from "../config/filterArgConfig";
import { DynamicField } from "./DynamicField";
import {
  FilterArgComplex,
  FilterArgPrimitive,
  WithSwitch,
} from "../config/filters";
import { isValWithSwitch } from "./utils/isValWithSwitch";
import { Form } from "antd";

export const FormFields: FC<{ config: Partial<ValueConfig> }> = ({
  config,
}) => {
  return (
    <>
      {Object.entries(filterArgConfig).map(([name, fieldConfig]) => {
        const val = config[name];
        if (Array.isArray(fieldConfig)) {
          if (isValWithSwitch(fieldConfig)) {
            const switchValue = fieldConfig[0];
            const values = (fieldConfig as WithSwitch<FilterArgComplex>)[1][0];
            const isSimpleValue = !Array.isArray(values);
            const valuesToRender = (isSimpleValue
              ? [values]
              : values) as unknown as FilterArgPrimitive[];
            return (
              <Form.Item label={name} wrapperCol={{ offset: 2, span: 16 }}>
                <DynamicField
                  label={switchValue.label!}
                  name={[name, "0"]}
                  key={switchValue.label}
                  config={switchValue}
                  value={val?.[0] || switchValue.default}
                />
                {valuesToRender.map((v, i) => {
                  return (
                    <DynamicField
                      label={v.label!}
                      name={[name, String(i + 1)]}
                      key={v.label || i + 1}
                      config={v}
                      value={
                        isSimpleValue
                          ? val?.[1]?.[0]
                          : val?.[1]?.[0]?.[i] || v.default
                      }
                    />
                  );
                })}
              </Form.Item>
            );
          }

          return (
            <Form.Item label={name} wrapperCol={{ offset: 2, span: 16 }}>
              {(fieldConfig as FilterArgPrimitive[]).map((v, i) => {
                return (
                  <DynamicField
                    label={v.label!}
                    name={[name, String(i)]}
                    key={v.label || i}
                    config={v}
                    value={val?.[i] || v.default}
                  />
                );
              })}
            </Form.Item>
          );
        }

        if (!("default" in fieldConfig)) {
          return (
            <Form.Item label={name} wrapperCol={{ offset: 2, span: 16 }}>
              {Object.entries(fieldConfig).map(([k, v]) => {
                return (
                  <DynamicField
                    label={k}
                    name={[name, k]}
                    key={k}
                    config={v}
                    value={val?.[k] || v.default}
                  />
                );
              })}
            </Form.Item>
          );
        }

        return (
          <DynamicField
            key={name}
            label={name}
            name={name}
            config={fieldConfig as FilterArgPrimitive}
            value={val}
          />
        );
      })}
    </>
  );
};
