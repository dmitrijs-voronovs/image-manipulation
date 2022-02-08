import { cloneDeep, merge } from "lodash";
import { ValueConfig } from "../../config/valueConfig";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { isValWithSwitch } from "./isValWithSwitch";

function convertArrWithSwitch(val: any, def: any): any[] {
  const valCopy = cloneDeep(val);
  const res = cloneDeep(def);
  // switch value
  if (valCopy[0] !== undefined) res[0] = valCopy[0];
  delete valCopy[0];
  if (Object.keys(valCopy).length === 1) {
    const v = Object.values(valCopy)[0];
    if (v) res[1][0] = v;
  } else {
    Object.entries(valCopy).forEach(([k, v]) => {
      if (v !== undefined) res[1][0][Number(k) - 1] = v;
    });
  }
  return res;
}

function convertArr(value: Object, def: any): any[] {
  const res = cloneDeep(def);
  Object.entries(value).forEach(([k, v]) => {
    if (v) res[k] = v;
  });
  return res;
}

export function convertFormValuesToConfig(all: Partial<ValueConfig>) {
  Object.entries(all)
    .filter(([_, v]) => typeof v === "object")
    .forEach(([field, value]) => {
      const def = getDefaultFilterValue(field);
      if (Array.isArray(def)) {
        if (isValWithSwitch(def)) {
          all[field] = convertArrWithSwitch(value, def);
        } else {
          all[field] = convertArr(value, def);
        }
      } else {
        const res: Record<string, unknown> = {};
        Object.entries(def).forEach(([k, v]) => {
          // required for fixing a bug with inputs referencing object fields
          const multiplier = 1e2;
          res[k] = (value[k] ?? v) * multiplier;
        });
        all[field] = res;
      }
    });
}
