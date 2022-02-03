import { CamanInstance } from "../../types/Caman";
import { ValueConfig } from "../../config/filters";
import { getDefaultFilterValue } from "../../config/utils/getDefaultFilterValue";

export const editImage = (
  caman: CamanInstance,
  config: Partial<ValueConfig>
) => {
  // window.Caman(`#canvaa`, function () {
  caman.reloadCanvasData();
  // caman.reset();
  caman.revert(false);
  console.log(caman);

  // Event.types = ["processStart", "processComplete", "renderStart", "renderFinished", "blockStarted", "blockFinished"];

  Object.entries(config).forEach(([filter, rawVal]) => {
    const val = rawVal ?? getDefaultFilterValue(filter);
    if (Array.isArray(val)) {
      console.log("arr", val);
      caman[filter](...val);
    } else if (typeof val === "boolean") {
      if (val) caman[filter]();
    } else if (typeof val === "string") {
      if (val) caman[filter](val);
    } else {
      console.log("val", val);
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
