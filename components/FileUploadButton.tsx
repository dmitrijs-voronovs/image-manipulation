import { ChangeEvent, FC, useRef } from "react";
import { getFileData } from "./utils/getFileData";
import { ImageData } from "./ImageEditor";
import { displayError } from "./utils/displayError";
import { Button } from "antd";

type FileUploadButtonProps = {
  onFileLoaded(images: ImageData[]): void;
};
export const FileUploadButton: FC<FileUploadButtonProps> = ({
  onFileLoaded,
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
      const results = await Promise.all<ImageData>(promises);
      onFileLoaded(results);
    } catch (e) {
      displayError();
    }
  };

  return (
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
  );
};
