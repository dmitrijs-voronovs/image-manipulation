import { cloneDeep, merge } from "lodash";
import { ValueConfig } from "../../config/valueConfig";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { isValWithSwitch } from "./isValWithSwitch";

function convertArrWithSwitch(val: any, def: any): any[] {
  const valCopy = cloneDeep(val);
  const res = cloneDeep(def);
  // switch value
  res[0] = valCopy[0];
  delete valCopy[0];
  if (Object.keys(valCopy).length === 1) {
    res[1][0] = Object.values(valCopy)[0];
  } else {
    Object.entries(valCopy).forEach(([k, v]) => {
      if (v) res[1][0][Number(k) - 1] = v;
    });
  }
  console.log("arr+Sw", val, def, res);
  return res;
}

function convertArr(value: Object, def: any): any[] {
  const res = cloneDeep(def);
  Object.entries(value).forEach(([k, v]) => {
    if (v) res[k] = v;
  });
  console.log("arr", value, def, res);
  return res;
}

export function convertFormValuesToConfig(all: Partial<ValueConfig>) {
  Object.entries(all)
    .filter(([_, v]) => typeof v === "object")
    .forEach(([field, value]) => {
      const def = getDefaultFilterValue(field);
      console.log(def);
      if (Array.isArray(def)) {
        if (isValWithSwitch(value)) {
          all[field] = convertArrWithSwitch(value, def);
        } else {
          all[field] = convertArr(value, def);
        }
      } else {
        all[field] = merge(def, value);
      }
    });
}
