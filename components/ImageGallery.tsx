import { ChangeEvent, Dispatch, FC, SetStateAction, useRef } from "react";
import { Button, Space } from "antd";
import { defaultImages, ImageData } from "./ImageEditor";
import { getFileData } from "./utils/getFileData";
import { displayError } from "./utils/displayError";

type ImageGalleryProps = {
  changeImage(img: ImageData): void;
  images: ImageData[];
  setImages: Dispatch<SetStateAction<ImageData[]>>;
};

export const ImageGallery: FC<ImageGalleryProps> = ({
  changeImage,
  images,
  setImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    e.persist();
    const files = e.target!.files;
    if (!files?.length) return;

    const promises = [];
    for (let i = 0; i < files.length; i++) {
      promises.push(getFileData(files[i]));
    }

    try {
      const results = await Promise.all(promises);
      setImages(results as ImageData[]);
    } catch (e) {
      displayError();
    }
  };

  return (
    <Space direction={"vertical"}>
      <Space wrap>
        {images.map((img) => {
          return (
            <Button
              key={img.name}
              onClick={() => changeImage(img)}
              style={{ width: 100, height: 100, margin: 0, padding: 5 }}
            >
              <img
                style={{ width: 90, height: 90 }}
                alt={img.name}
                src={img.src}
              />
            </Button>
          );
        })}
      </Space>
      <Space>
        <Button
          onClick={() => {
            fileInputRef.current!.click();
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            id={"upload-file"}
            onChange={(e) => handleFileUpload(e)}
            multiple
            hidden
          />
          + Upload
        </Button>
        <Button onClick={() => setImages(defaultImages)}>
          Reset to default images
        </Button>
      </Space>
    </Space>
  );
};
