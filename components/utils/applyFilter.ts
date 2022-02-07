import { CamanInstance, CamanInstanceLayer } from "../../types/Caman";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { isValWithSwitch } from "./isValWithSwitch";

export function applyFilter(
  rawVal: any,
  filter: string,
  caman: CamanInstance | CamanInstanceLayer,
  applyAsFilter: boolean = false
) {
  const val = rawVal ?? getDefaultFilterValue(filter);
  const editor = applyAsFilter
    ? (caman.filter as unknown as CamanInstanceLayer)
    : (caman as CamanInstance);

  console.log(filter, val, editor);

  if (Array.isArray(val)) {
    if (isValWithSwitch(val)) {
      const isFilterEnabled = val[0] as boolean;
      if (isFilterEnabled) {
        const argWithSwitch = (val[1] as any[])[0]!;
        const args = Array.isArray(argWithSwitch)
          ? argWithSwitch.map((v: any) => v)
          : argWithSwitch;
        // @ts-ignore
        editor[filter](args);
      }
    } else {
      // @ts-ignore
      editor[filter](...val);
    }
  } else if (typeof val === "boolean") {
    // @ts-ignore
    if (val) editor[filter]();
  } else if (typeof val === "string") {
    // @ts-ignore
    if (val) editor[filter](val);
  } else {
    // @ts-ignore
    if (val) editor[filter](val);
  }
}
