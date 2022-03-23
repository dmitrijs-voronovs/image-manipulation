import { canvasId } from "../ImageEditor";

export const setTargetImageScale = (v: number) => {
  const el = document.getElementById(canvasId);
  if (!el) return;

  el.style.transformOrigin = "0% 0%";
  el.style.transform = `scale(${v})`;
};
