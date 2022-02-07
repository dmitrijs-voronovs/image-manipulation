import { ImageData } from "./imageConfig";

export const getFileData = async (file: File): Promise<ImageData> =>
  new Promise((res, rej) => {
    if (!file) {
      return rej("no file specified");
    }

    const reader = new FileReader();
    const fileName = file.name;
    reader.addEventListener(
      "load",
      (_e) => {
        const result = reader.result?.toString();
        if (result) res({ name: fileName, src: result });
        rej(`Something went wrong with ${fileName}`);
      },
      false
    );
    reader.readAsDataURL(file);
  });
