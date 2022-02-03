export type FilterArgBase = {
    label?: string
}
export type FilterArgSteppable = {
    step?: number
}

export type FilterArgNumber = FilterArgBase & FilterArgSteppable & {
    min: number, max: number, default?: number
};
export type FilterArgString = FilterArgBase & { default?: string };
export type FilterArgBool = FilterArgBase & { default?: boolean };
export const SWITCH_ARG_LABEL = 'applied';
export type FilterArgSwitch = FilterArgBool & FilterArgBase & { label: 'applied' };
export type FilterArg = FilterArgNumber | FilterArgString | FilterArgBool
export type WithSwitch<T extends FilterArg> = [FilterArgSwitch, T]
export type FilterArgs = FilterArg | FilterArg[] | Record<string, FilterArg>

export interface MainFilters extends Record<string, FilterArgs> {
    brightness: FilterArgNumber,
    channels: {
        red: FilterArgNumber, green: FilterArgNumber, blue: FilterArgNumber,
    },
    clip: FilterArgNumber,
    colorize: [FilterArgString, FilterArgNumber]
    contrast: FilterArgNumber,
    exposure: FilterArgNumber,
    fillColor: WithSwitch<FilterArgString>
    gamma: FilterArgNumber
    greyscale: FilterArgBool
    hue: FilterArgNumber,
    invert: FilterArgBool,
    noise: FilterArgNumber,
    saturation: FilterArgNumber,
    sepia: FilterArgNumber,
    vibrance: FilterArgNumber,
    stackBlur: FilterArgNumber,
    boxBlur: FilterArgBool,
    heavyRadialBlur: FilterArgBool,
    gaussianBlur: FilterArgBool,
    motionBlur: WithSwitch<FilterArgNumber>,
    sharpen: FilterArgNumber,
    vignette: [FilterArgNumber,FilterArgNumber],
    // TODO: maybe add?
    // rectangularVignette: [FilterArgNumber,FilterArgNumber, ]
    // tiltShift: [{
    //     center: {
    //
    //     }
    // }]
    // radialBlur
    edgeEnhance: FilterArgBool,
    edgeDetect: FilterArgBool,
    emboss: FilterArgBool,
    posterize: WithSwitch<FilterArgNumber>,
    threshold: WithSwitch<FilterArgNumber>,
    rotate: WithSwitch<FilterArgNumber>
}

export interface AdditionalFilters extends Record<string, FilterArgs> {
    crop: [FilterArgNumber, FilterArgNumber, FilterArgNumber, FilterArgNumber],
    resize: [FilterArgNumber, FilterArgNumber]
}

export interface FilterArgConfig extends MainFilters, AdditionalFilters {}

const delta200 = (label?: FilterArgNumber['label']): FilterArgNumber => ({
    min: -100, max: 100, default: 0, label
});
const delta100 = (label?: FilterArgNumber['label']): FilterArgNumber => ({
    min: 0, max: 100, default: 0, label
});
const falseSwitch: FilterArgSwitch = {default: false, label: SWITCH_ARG_LABEL };

const degrees = {
    min: 0,
    max: 360,
    default: 0,
    label: 'degrees'
};
export const filterArgConfig: FilterArgConfig = {
    brightness: delta200(), channels: {
        red: delta200(), green: delta200(), blue: delta200()
    }, clip: delta100(), colorize: [{default: '#ffffff', label: 'color'}, delta100('value')], contrast: delta200(), exposure: delta200(), // TODO: add filter arg
    fillColor: [falseSwitch, {default: '#ffffff'}], gamma: {
        min: 0, max: 5, default: 1,
    }, greyscale: {default: false}, hue: delta100(), invert: {default: false}, noise: {
        min: 0, max: 100, default: 0
    }, saturation: delta200(), sepia: delta100(), vibrance: delta200(), stackBlur: {
        min: 0, max: 50, default: 0
    },
    crop: [{
        min: 0, max: 2000, label: "width"
    },{
        min: 0, max: 2000, label: "height"
    },{
        min: 0, max: 2000, label: "x"
    },{
        min: 0, max: 2000, label: "y"
    },],
    resize: [{
        min: 0, max: 2000, label: "width"
    },{
        min: 0, max: 2000, label: "height"
    },],
    boxBlur: { default: false },
    heavyRadialBlur: { default: false },
    gaussianBlur: { default: false },
    motionBlur: [falseSwitch, degrees],
    sharpen: delta100(),
    vignette: [delta100('size'), delta100('strength')],
    edgeEnhance: { default: false },
    edgeDetect: { default: false },
    emboss: { default: false },
    posterize: [falseSwitch, {
        min: 0,
        max: 255,
        default: 0,
        step: 1,
    }],
    threshold: [falseSwitch, delta200("value")],
    rotate: [falseSwitch, degrees]
}
export type ValueConfig = {
    [Key in keyof FilterArgConfig]: FilterArgConfig[Key] extends Array<FilterArg> ? NonNullable<FilterArg['default']>[] : FilterArgConfig[Key] extends FilterArg ? NonNullable<FilterArgConfig[Key]['default']> : FilterArgConfig[Key] extends Record<string, FilterArg> ? { [ObjKey in keyof FilterArgConfig[Key]]: NonNullable<FilterArgConfig[Key][ObjKey]['default']> } : unknown
}