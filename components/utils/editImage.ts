import { CamanInstance } from "../../types/Caman";
import { applyFilter } from "./applyFilter";
import { UserValues } from "../ImageEditor";
import { filterArgLayerConfig } from "../../config/filterArgConfig";
import { BASE_LAYER_IDX } from "./layerConfig";

export const editImage = (
  caman: CamanInstance,
  userValues: UserValues,
  cb?: () => void
) => {
  caman.reloadCanvasData();
  caman.revert(false);
  const baseLayer = userValues[0];

  Object.entries(baseLayer).forEach(([filter, rawVal]) => {
    applyFilter(rawVal, filter, caman);
  });

  // caman.newLayer(function () {
  //   this.setBlendingMode("normal");
  //   this.copyParent();
  //   this.opacity(90);
  //   this.filter.invert();
  //   this.filter.gamma(10);
  // });

  // console.log(userValues);
  userValues.slice(BASE_LAYER_IDX).map((layerValues, i) => {
    console.log(layerValues, i);
    caman.newLayer(function () {
      this.copyParent();
      this.opacity(0);
      this.setBlendingMode("normal");

      Object.entries(layerValues).forEach(([filter, rawVal]) => {
        if (Object.keys(filterArgLayerConfig).includes(filter)) {
          applyFilter(rawVal, filter, this);
        } else {
          console.log(filter, rawVal);
          applyFilter(rawVal, filter, this, true);
        }
      });
    });
  });

  caman.render(cb);
};
