import { FC } from "react";
import { ValueConfig } from "../config/valueConfig";
import { DynamicField } from "./DynamicField";
import {
  FilterArgComplex,
  FilterArgPrimitive,
  FilterConfiguration,
  WithSwitch,
} from "../config/filters";
import { isValWithSwitch } from "./utils/isValWithSwitch";
import { Form } from "antd";
import { Label } from "./Label";

export const FormFields: FC<{
  userValues: Partial<ValueConfig>;
  optionConfig: FilterConfiguration;
  showHints?: boolean;
}> = ({ userValues, optionConfig, showHints = false }) => {
  return (
    <>
      {Object.entries(optionConfig).map(([name, fieldConfig]) => {
        const filterValue = userValues[name];
        const label = showHints ? <Label name={name} /> : name;
        if (Array.isArray(fieldConfig)) {
          if (isValWithSwitch(fieldConfig)) {
            const switchValue = fieldConfig[0];
            const values = (fieldConfig as WithSwitch<FilterArgComplex>)[1][0];
            const isSimpleValue = !Array.isArray(values);
            const valuesToRender = (isSimpleValue
              ? [values]
              : values) as unknown as FilterArgPrimitive[];
            return (
              <Form.Item label={label} wrapperCol={{ offset: 1, span: 17 }}>
                <DynamicField
                  label={switchValue.label!}
                  name={[name, "0"]}
                  key={switchValue.label}
                  config={switchValue}
                  value={filterValue?.[0] ?? switchValue.default}
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
                          ? filterValue?.[1]?.[0]
                          : filterValue?.[1]?.[0]?.[i] ?? v.default
                      }
                    />
                  );
                })}
              </Form.Item>
            );
          }

          return (
            <Form.Item label={label} wrapperCol={{ offset: 1, span: 17 }}>
              {(fieldConfig as FilterArgPrimitive[]).map((v, i) => {
                return (
                  <DynamicField
                    label={v.label!}
                    name={[name, String(i)]}
                    key={v.label || i}
                    config={v}
                    value={filterValue?.[i] ?? v.default}
                  />
                );
              })}
            </Form.Item>
          );
        }

        const isObject = !("default" in fieldConfig);
        if (isObject) {
          return (
            <Form.Item label={label} wrapperCol={{ offset: 1, span: 17 }}>
              {Object.entries(fieldConfig).map(([k, v]) => {
                return (
                  <DynamicField
                    label={k}
                    name={[name, k]}
                    key={k}
                    config={v}
                    value={filterValue?.[k] ?? v.default}
                  />
                );
              })}
            </Form.Item>
          );
        }

        return (
          <DynamicField
            showHint={showHints}
            key={name}
            label={name}
            name={name}
            config={fieldConfig as FilterArgPrimitive}
            value={filterValue}
          />
        );
      })}
    </>
  );
};
