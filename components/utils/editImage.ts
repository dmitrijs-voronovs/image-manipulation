import { CamanInstance } from "../../types/Caman";
import { ValueConfig } from "../../config/valueConfig";
import { filtersRequireReloading } from "../../config/filterArgConfig";
import { applyFilter } from "./applyFilter";

export const editImage = (
  caman: CamanInstance,
  config: Partial<ValueConfig>,
  cb?: () => void
) => {
  caman.reloadCanvasData();
  caman.revert(false);
  console.log(caman);

  Object.entries(config).forEach(([filter, rawVal]) => {
    if (!filtersRequireReloading.includes(filter))
      applyFilter(rawVal, filter, caman);
  });

  // caman.crop(300, 300, 200, 200);
  // caman.brightness(50);
  // caman.rotate(15);
  //
  // caman.render(function () {
  //   // caman.rotate(30);
  //   // caman.resize(5);
  //   // caman.render(function () {
  //   //   // caman.render()
  //   // });
  // });

  caman.render(cb);

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
