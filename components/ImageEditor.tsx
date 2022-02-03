import { ValueConfig } from "../config/filters";
import { useCallback, useEffect, useRef, useState } from "react";
import { CamanInstance } from "../types/Caman";
import { LoadingOutlined } from "@ant-design/icons";
import { Col, Row, Space } from "antd";
import { ParameterForm } from "./ParameterForm";
import { ImageGallery } from "./ImageGallery";
import { editImage } from "./utils/editImage";

export function ImageEditor() {
  const [config, setConfig] = useState<Partial<ValueConfig>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const imgId = `img${currentImage.slice(1, 3)}`;
  console.log({ imgId });
  const downloadImgButtonRef = useRef<HTMLAnchorElement>(null);
  const camanRef = useRef<CamanInstance>();

  const onFinishRender = useCallback(
    (caman: CamanInstance) => {
      const downloadButton = downloadImgButtonRef.current;
      if (downloadButton) {
        downloadButton.href = caman.toBase64();
        downloadButton.download = `${currentImage}-${Date.now()}.png`;
        setIsLoading(false);
      }
    },
    [currentImage]
  );

  const handleButtonClick = useCallback(() => {
    if (currentImage && window?.Caman) {
      setIsLoading(true);

      camanRef.current = window.Caman(`#target`, currentImage, function () {
        editImage(this, config);
        this.render(() => onFinishRender(this));
      });
    }
  }, [config, currentImage, onFinishRender]);

  function changeImage(newSrc: string) {
    const canv = document.getElementById("target");
    canv?.removeAttribute("data-caman-id");
    setCurrentImage(newSrc);
  }

  useEffect(() => {
    handleButtonClick();
  }, [currentImage, handleButtonClick]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%" }}>
        {isLoading && <LoadingOutlined style={{ fontSize: "50px" }} />}
      </div>
      <Row
        style={{ width: "100vw" }}
        align={"middle"}
        justify={"center"}
        gutter={48}
      >
        <Col
          xs={24}
          sm={12}
          style={{
            position: "sticky",
            top: 20,
            padding: 10,
            alignSelf: "flex-start",
          }}
        >
          {currentImage ? (
            <Space direction={"horizontal"}>
              <img src={currentImage} width={300} />
              <canvas id={"target"} />
            </Space>
          ) : (
            <Space style={{ textAlign: "center" }} align={"center"}>
              Please select an image
            </Space>
          )}
        </Col>
        <Col xs={24} sm={12}>
          <ParameterForm
            downloadImgButtonRef={downloadImgButtonRef}
            userConfig={config}
            setConfig={setConfig}
          />
        </Col>
        <Col span={24} style={{ flexWrap: "wrap" }}>
          <ImageGallery changeImage={changeImage} />
        </Col>
      </Row>
    </div>
  );
}
