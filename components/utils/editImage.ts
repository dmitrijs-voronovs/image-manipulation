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
    if (!Object.keys(filterArgLayerConfig).includes(filter))
      applyFilter(rawVal, filter, caman);
  });

  userValues.slice(BASE_LAYER_IDX).map((layerValues, i) => {
    caman.newLayer(function () {
      this.copyParent();
      this.opacity(0);
      this.setBlendingMode("normal");

      Object.entries(layerValues).forEach(([filter, rawVal]) => {
        if (Object.keys(filterArgLayerConfig).includes(filter)) {
          applyFilter(rawVal, filter, this);
        } else {
          applyFilter(rawVal, filter, this, true);
        }
      });
    });
  });

  caman.render(cb);
};
