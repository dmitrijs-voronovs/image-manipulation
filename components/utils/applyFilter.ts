import { CamanInstance } from "../../types/Caman";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { isValWithSwitch } from "./isValWithSwitch";

export function applyFilter(rawVal: any, filter: string, caman: CamanInstance) {
  const val = rawVal ?? getDefaultFilterValue(filter);

  if (Array.isArray(val)) {
    if (isValWithSwitch(val)) {
      const isFilterEnabled = val[0] as boolean;
      if (isFilterEnabled) {
        const argWithSwitch = (val[1] as any[])[0]!;
        const args = Array.isArray(argWithSwitch)
          ? argWithSwitch.map((v: any) => v)
          : argWithSwitch;
        caman[filter](args);
      }
    } else {
      caman[filter](...val);
    }
  } else if (typeof val === "boolean") {
    if (val) caman[filter]();
  } else if (typeof val === "string") {
    if (val) caman[filter](val);
  } else {
    caman[filter](val);
  }
}
