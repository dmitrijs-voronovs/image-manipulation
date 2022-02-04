import { CamanInstance } from "../../types/Caman";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";
import { ValueConfig } from "../../config/valueConfig";
import { isValWithSwitch } from "./isValWithSwitch";

export const editImage = (
  caman: CamanInstance,
  config: Partial<ValueConfig>
) => {
  caman.reloadCanvasData();
  caman.revert(false);
  console.log(caman);

  Object.entries(config).forEach(([filter, rawVal]) => {
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
  });

  //
  // this.newLayer(function() {
  //
  //
  //     this.setBlendingMode('normal');
  //     this.opacity(50);
  //     this.overlayImage("/00.jpg")
  //     Object.entries(config).forEach(([filter, rawVal]) => {
  //         const val = rawVal ?? getDefaultFilterValue(filter)
  //         if (Array.isArray(val)) {
  //             console.log('arr', val);
  //             this.filter[filter](...val)
  //         } else if (typeof val === 'boolean') {
  //             if (val) this.filter[filter]();
  //         } else if (typeof val === 'string') {
  //             if (val) this.filter[filter](val);
  //         } else {
  //             console.log('val', val);
  //             this.filter[filter](val)
  //         }
  //     })
  //
  //     this.newLayer(function() {
  //
  //
  //         this.setBlendingMode('exclusion');
  //         this.opacity(50);
  //         this.overlayImage("/01.jpg")
  //         Object.entries(config).forEach(([filter, rawVal]) => {
  //             const val = rawVal ?? getDefaultFilterValue(filter)
  //             if (Array.isArray(val)) {
  //                 console.log('arr', val);
  //                 this.filter[filter](...val)
  //             } else if (typeof val === 'boolean') {
  //                 if (val) this.filter[filter]();
  //             } else if (typeof val === 'string') {
  //                 if (val) this.filter[filter](val);
  //             } else {
  //                 console.log('val', val);
  //                 this.filter[filter](val)
  //             }
  //         })
  //
  //         // this.fillColor('#f49600');
  //         // this.invert(true);
  //     })
  //
  //     // this.fillColor('#f49600');
  //     // this.invert(true);
  // })
};
