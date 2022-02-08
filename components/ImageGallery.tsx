import { Dispatch, FC, SetStateAction } from "react";
import { Button, Space } from "antd";
import { FileUploadButton } from "./FileUploadButton";
import { defaultImages, ImageData } from "./utils/imageConfig";

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
  return (
    <Space direction={"vertical"} size={"middle"}>
      <Space size={"middle"}>
        <FileUploadButton onFileLoaded={(files) => setImages(files)} />
        <Button onClick={() => setImages(defaultImages)}>
          Reset to default images
        </Button>
      </Space>
      <Space style={{ marginBottom: "15px" }} wrap>
        {images.map((img) => {
          return (
            <Button
              key={img.name}
              onClick={() => changeImage(img)}
              style={{ width: 100, height: 100, margin: 0, padding: 0 }}
            >
              <img
                style={{ width: 100, height: 100, objectFit: "cover" }}
                alt={img.name}
                src={img.src}
              />
            </Button>
          );
        })}
      </Space>
    </Space>
  );
};
