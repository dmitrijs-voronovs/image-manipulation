import {FilterArgConfig} from "../pages";

type ModificationFunctions = {
    [Key in keyof FilterArgConfig]: Function
}
type CamanInstance = ModificationFunctions & {
    reset: Function;
    render(cb?: Function): void;
    newLayer(cb?: (this: Omit<CamanInstance, keyof ModificationFunctions> & { filter: ModificationFunctions }) => void): void
}
declare global {
    interface Window {
        Caman?: {
            (imgId: string, init: (this: CamanInstance) => void): void;

        }
    }
}