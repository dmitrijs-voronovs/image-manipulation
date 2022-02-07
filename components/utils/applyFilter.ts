import { CamanInstance } from "../../types/Caman";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { isValWithSwitch } from "./isValWithSwitch";

export function applyFilter(
  rawVal: any,
  filter: string,
  caman: CamanInstance,
  isFilter: boolean = false
) {
  // caman.filter.greyscale();
  // caman.setBlendingMode("normal");
  // caman.opacity(100);
  // return caman.filter.brightness(30);

  const val = rawVal ?? getDefaultFilterValue(filter);
  const editor = isFilter ? caman.filter : caman;

  if (Array.isArray(val)) {
    if (isValWithSwitch(val)) {
      const isFilterEnabled = val[0] as boolean;
      if (isFilterEnabled) {
        const argWithSwitch = (val[1] as any[])[0]!;
        const args = Array.isArray(argWithSwitch)
          ? argWithSwitch.map((v: any) => v)
          : argWithSwitch;
        editor[filter](args);
      }
    } else {
      editor[filter](...val);
    }
  } else if (typeof val === "boolean") {
    if (val) editor[filter]();
  } else if (typeof val === "string") {
    if (val) editor[filter](val);
  } else {
    editor[filter](val);
  }
}
