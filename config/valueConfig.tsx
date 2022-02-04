import {
  BaseFilterArgs,
  FilterArgComplex,
  FilterArgConfig,
  FilterArgPrimitive,
  FilterArgs,
  FilterArgSwitch,
  WithSwitch,
} from "./filters";

type PrimitiveArgExtractor<T> = T extends FilterArgPrimitive
  ? T["default"]
  : never;

type ComplexArgExtractor<T extends FilterArgComplex> = {
  [Key in keyof T]: PrimitiveArgExtractor<T[Key]>;
};

type BaseArgExtractor<T extends BaseFilterArgs> = T extends FilterArgPrimitive
  ? PrimitiveArgExtractor<T>
  : T extends FilterArgComplex
  ? ComplexArgExtractor<T>
  : never;

type WithSwitchExtractor<T extends WithSwitch<BaseFilterArgs>> = [
  FilterArgSwitch["default"],
  [BaseArgExtractor<T[1][0]>]
];

/**
 * @example
 * FilterArgsExtractor<FilterArgNumber> // 2;
 * FilterArgsExtractor<FilterArgBool> // true;
 * FilterArgsExtractor<[FilterArgNumber, FilterArgString]> // [2, "sr"];
 * FilterArgsExtractor<WithSwitch<FilterArgNumber>> // [true, [2]];
 * FilterArgsExtractor<
 *   WithSwitch<[FilterArgNumber, FilterArgString]>
 * > // [true, [[1, "12"]]];
 * FilterArgsExtractor<{ red: FilterArgNumber }> // { red: 2 };
 * FilterArgsExtractor<WithSwitch<{ red: FilterArgNumber }>> // [
 *   true,
 *   [{ red: 2 }],
 * ];
 */
type FilterArgsExtractor<T extends FilterArgs> = T extends BaseFilterArgs
  ? BaseArgExtractor<T>
  : T extends WithSwitch<BaseFilterArgs>
  ? WithSwitchExtractor<T>
  : never;

export type ValueConfig = {
  [Key in keyof FilterArgConfig]: FilterArgsExtractor<FilterArgConfig[Key]>;
};
