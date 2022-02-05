import { filterArgConfig } from "../filterArgConfig";
import { BaseFilterArgs, FilterArgPrimitive, WithSwitch } from "../filters";
import { isValWithSwitch } from "../../components/utils/isValWithSwitch";

export function getDefaultFilterValue(filterName: string) {
  const filter = filterArgConfig[filterName];
  if (Array.isArray(filter)) {
    if (isValWithSwitch(filter)) {
      const argWithSwitch = (filter as WithSwitch<BaseFilterArgs>)[1][0];
      return Array.isArray(argWithSwitch)
        ? argWithSwitch.map((v) => v.default)
        : argWithSwitch.default;
    }
    console.log("converting", filterName, filter);
    return (filter as FilterArgPrimitive[]).map((v) => v.default);
  }

  if (!("default" in filter)) {
    return Object.entries(filter).reduce<Record<string, FilterArgPrimitive>>(
      (defaults, [key, val]) => {
        defaults[key] = val.default;
        return defaults;
      },
      {}
    );
  }

  return (filter as FilterArgPrimitive).default;
}
