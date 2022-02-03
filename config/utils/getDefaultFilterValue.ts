import {filterArgConfig} from "../filters";

export function getDefaultFilterValue(filter1: string) {
    const filter = filterArgConfig[filter1];
    if (Array.isArray(filter)) {
        return filter.map(val => val.default);
    }

    return filter.default;
}