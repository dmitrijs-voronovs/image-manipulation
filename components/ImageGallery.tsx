import { Dispatch, FC, SetStateAction } from "react";
import { Button, Space } from "antd";
import { defaultImages, ImageData } from "./ImageEditor";
import { FileUploadButton } from "./FileUploadButton";

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
        <FileUploadButton onFileLoaded={(files) => setImages(files)} />
        <Button onClick={() => setImages(defaultImages)}>
          Reset to default images
        </Button>
      </Space>
    </Space>
  );
};
