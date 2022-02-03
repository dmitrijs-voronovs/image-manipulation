import {FilterArgConfig} from "../config/filters";

type ModificationFunctions = {
    [Key in keyof FilterArgConfig]: Function
}
export type CamanInstance = ModificationFunctions & {
    reset: Function;
    render(cb?: Function): void;
    newLayer(cb?: (this: Omit<CamanInstance, keyof ModificationFunctions> & { filter: ModificationFunctions }) => void): void
}
export type Caman = {
    (imgId: string | HTMLImageElement | HTMLCanvasElement, init: (this: CamanInstance) => void): CamanInstance;
    (canvasId: string | HTMLImageElement | HTMLCanvasElement, src: string, init: (this: CamanInstance) => void): CamanInstance;

};
declare global {
    interface Window {
        Caman?: Caman
    }
}