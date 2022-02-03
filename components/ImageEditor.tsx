import { ValueConfig } from "../config/filters";
import { useCallback, useEffect, useRef, useState } from "react";
import { CamanInstance } from "../types/Caman";
import { LoadingOutlined } from "@ant-design/icons";
import { Col, Row, Space } from "antd";
import { ParameterForm } from "./ParameterForm";
import { ImageGallery } from "./ImageGallery";
import { editImage } from "./utils/editImage";

const canvasId = "target";

export function ImageEditor() {
  const [config, setConfig] = useState<Partial<ValueConfig>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const downloadImgButtonRef = useRef<HTMLAnchorElement>(null);

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

      window.Caman(`#target`, currentImage, function () {
        editImage(this, config);
        this.render(() => onFinishRender(this));
      });
    }
  }, [config, currentImage, onFinishRender]);

  function changeImage(newSrc: string) {
    const canv = document.getElementById(canvasId);
    canv?.removeAttribute("data-caman-id");
    setCurrentImage(newSrc);
  }

  useEffect(() => {
    handleButtonClick();
  }, [currentImage, handleButtonClick]);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "fixed",
          overflow: "auto",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && (
          <div>
            <LoadingOutlined style={{ fontSize: "50px" }} />
          </div>
        )}
      </div>
      <Row
        style={{ width: "100%" }}
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
            <Space key={"canvas"} direction={"horizontal"}>
              <img src={currentImage} width={300} />
              <canvas id={canvasId} />
            </Space>
          ) : (
            <Space
              key={"empty"}
              direction={"vertical"}
              style={{ textAlign: "center", top: "40%", fontSize: "1.2rem" }}
            >
              <p>
                Please select an image below or
                <br />
                or upload custom images
              </p>
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
