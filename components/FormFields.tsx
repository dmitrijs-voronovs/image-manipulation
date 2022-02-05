import { FC } from "react";
import { ValueConfig } from "../config/valueConfig";
import { filterArgConfig } from "../config/filterArgConfig";
import { DynamicField } from "./DynamicField";
import { FilterArgPrimitive } from "../config/filters";
import { isValWithSwitch } from "./utils/isValWithSwitch";
import { Form, Space } from "antd";
import { formLayout, tailLayout } from "./ParameterForm";

export const FormFields: FC<{ config: Partial<ValueConfig> }> = ({
  config,
}) => {
  return (
    <>
      {Object.entries(filterArgConfig).map(([name, fieldConfig]) => {
        const val = config[name];
        if (Array.isArray(fieldConfig)) {
          // for all the arrays
          // name={["some", "[0]"]}
          // which forms
          // {"some": {
          //   "[0]": "123",
          //       "[1]": "demo"
          // }}
          // that on value change can be parsed as
          // Array.from(Object.values({0: 1241, 1: "124"}))
          if (isValWithSwitch(fieldConfig)) {
            const switchValue = fieldConfig[0];
            return (
              <>
                with switch
                <pre>
                  {name}:{JSON.stringify(fieldConfig, null, 2)}
                </pre>
              </>
            );
          }
          return (
            <>
              no switch array
              <pre>
                {name}:{JSON.stringify(fieldConfig, null, 2)}
              </pre>
            </>
          );
          console.log("arr", fieldConfig);
        } else if (!("default" in fieldConfig)) {
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
        } else
          return (
            <DynamicField
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
