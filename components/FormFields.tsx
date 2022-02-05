import { FC } from "react";
import { ValueConfig } from "../config/valueConfig";
import { filterArgConfig } from "../config/filterArgConfig";
import { DynamicField } from "./DynamicField";
import { FilterArgPrimitive } from "../config/filters";
import { isValWithSwitch } from "./utils/isValWithSwitch";

export const FormFields: FC<{ config: Partial<ValueConfig> }> = ({
  config,
}) => {
  return (
    <>
      {Object.entries(filterArgConfig).map(([name, fieldConfig]) => {
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
            return (
              <>
                with switch
                <pre>{JSON.stringify(fieldConfig, null, 2)}</pre>
              </>
            );
          }
          return (
            <>
              no switch array
              <pre>{JSON.stringify(fieldConfig, null, 2)}</pre>
            </>
          );
          console.log("arr", fieldConfig);
        } else if (!("default" in fieldConfig)) {
          // meaning complex object
          // nothing special
          // name={['filter','field']}
          console.log("obj", fieldConfig);
          return (
            <>
              object
              <pre>{JSON.stringify(fieldConfig, null, 2)}</pre>
            </>
          );
        } else
          return (
            <DynamicField
              name={name}
              config={fieldConfig as FilterArgPrimitive}
              value={config[name]}
            />
          );
      })}
    </>
  );
};
