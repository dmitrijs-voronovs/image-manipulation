import { ValueConfig } from "../../config/filters";
import { editImage } from "./editImage";
import { CamanInstance } from "../../types/Caman";

function moveElementOutOfScreen(element: HTMLElement) {
  element.style.position = "absolute";
  element.style.top = "-999999px";
}

const createCanvas = (id: string) => {
  const canvas = document.createElement("canvas");
  canvas.id = id;
  moveElementOutOfScreen(canvas);
  return document.body.appendChild(canvas);
};

const removeElement = (id: string) => {
  document.getElementById(id)?.remove();
};

function downloadImage(name: string, src: string, caman: CamanInstance) {
  const a = document.createElement("a");
  a.href = caman.toBase64();
  a.download = `${name}-${Date.now()}.png`;
  moveElementOutOfScreen(a);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const editAndDownload = async (
  name: string,
  src: string,
  config: Partial<ValueConfig>
) => {
  const canvasId = "canvas_" + name;
  const el = createCanvas(canvasId);
  console.log(el);

  return new Promise((res, rej) => {
    if (window.Caman) {
      window.Caman(`#${canvasId}`, src, function () {
        editImage(this, config);
        this.render(() => {
          downloadImage(`img-${canvasId}`, src, this);
          removeElement(canvasId);
          res(`Image ${name} downloaded`);
        });
      });
    } else {
      rej(`Failed for img ${src}`);
    }
  });
};
