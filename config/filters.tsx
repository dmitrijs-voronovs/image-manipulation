export type FilterArgNumber = {
    min: number, max: number, default?: number
};
export type FilterArgString = { default?: string };
export type FilterArgBool = { default?: boolean };
export type FilterArg = FilterArgNumber | FilterArgString | FilterArgBool
type FilterArgs = FilterArg | FilterArg[] | Record<string, FilterArg>

export interface FilterArgConfig extends Record<string, FilterArgs> {
    brightness: FilterArgNumber,
    channels: {
        red: FilterArgNumber, green: FilterArgNumber, blue: FilterArgNumber,
    },
    clip: FilterArgNumber,
    colorize: [FilterArgString, FilterArgNumber]
    contrast: FilterArgNumber,
    exposure: FilterArgNumber,
    fillColor: FilterArgString
    gamma: FilterArgNumber
    greyscale: FilterArgBool
    hue: FilterArgNumber,
    invert: FilterArgBool,
    noise: FilterArgNumber,
    saturation: FilterArgNumber,
    sepia: FilterArgNumber,
    vibrance: FilterArgNumber,
    stackBlur: FilterArgNumber,
}

const delta200: FilterArgNumber = {
    min: -100, max: 100, default: 0
};
const delta100: FilterArgNumber = {
    min: 0, max: 100, default: 0
};
export const filterArgConfig: FilterArgConfig = {
    brightness: delta200, channels: {
        red: delta200, green: delta200, blue: delta200
    }, clip: delta100, colorize: [{default: ''}, delta100], contrast: delta200, exposure: delta200, // TODO: add filter arg
    fillColor: {default: ''}, gamma: {
        min: 0, max: 5, default: 1,
    }, greyscale: {default: false}, hue: delta100, invert: {default: false}, noise: {
        min: 0, max: 100, default: 0
    }, saturation: delta200, sepia: delta100, vibrance: delta200, stackBlur: {
        min: 0, max: 50, default: 0
    },
}
export type ValueConfig = {
    [Key in keyof FilterArgConfig]: FilterArgConfig[Key] extends Array<FilterArg> ? NonNullable<FilterArg['default']>[] : FilterArgConfig[Key] extends FilterArg ? NonNullable<FilterArgConfig[Key]['default']> : FilterArgConfig[Key] extends Record<string, FilterArg> ? { [ObjKey in keyof FilterArgConfig[Key]]: NonNullable<FilterArgConfig[Key][ObjKey]['default']> } : unknown
}