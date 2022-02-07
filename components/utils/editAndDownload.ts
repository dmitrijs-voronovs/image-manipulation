import { editImage } from "./editImage";
import { CamanInstance } from "../../types/Caman";
import pLimit from "p-limit";
import { notification } from "antd";
import { displayError } from "./displayError";
import { ValueConfig } from "../../config/valueConfig";
import { ImageData } from "./imageConfig";
import { UserValues } from "../ImageEditor";

export const downloadImagesInBulks = async (
  images: ImageData[],
  config: UserValues
) => {
  const limit = pLimit(5);
  const promises = images.map(({ name, src }) =>
    limit(() => editAndDownload(name, src, config))
  );
  try {
    await Promise.all(promises);
    notification.success({ message: "Successfully downloaded all images" });
  } catch (e) {
    displayError();
  }
};

const editAndDownload = async (
  name: string,
  src: string,
  config: UserValues
) => {
  const sanitizedName = name.replace(new RegExp(/\W+/g), "");
  const canvasId = "canvas_" + sanitizedName;
  const el = createCanvas(canvasId);

  return new Promise((res, rej) => {
    if (window.Caman) {
      window.Caman(`#${canvasId}`, src, function () {
        editImage(this, config);
        this.render(() => {
          downloadImage(sanitizedName, src, this);
          removeElement(canvasId);
          res(`Image ${sanitizedName} downloaded`);
        });
      });
    } else {
      rej(`Failed for img ${src}`);
    }
  });
};

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
