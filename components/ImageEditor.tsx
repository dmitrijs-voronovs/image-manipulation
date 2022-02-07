import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CamanInstance } from "../types/Caman";
import { LoadingOutlined } from "@ant-design/icons";
import { Col, Row, Space } from "antd";
import { ParameterForm } from "./ParameterForm";
import { ImageGallery } from "./ImageGallery";
import { editImage } from "./utils/editImage";
import { ValueConfig } from "../config/valueConfig";
import { BASE_LAYER_IDX, N_OF_ADDITIONAL_LAYERS } from "./utils/layerConfig";
import { defaultImages, ImageData } from "./utils/imageConfig";
import { defaultUserValue } from "../config/filterArgConfig";

const canvasId = "target";

export type UserValues = Partial<ValueConfig>[];

const initialUserConfig = Array.from({
  length: 1 + N_OF_ADDITIONAL_LAYERS,
}).map((_) => defaultUserValue);

export function ImageEditor() {
  const [userValues, setUserValues] = useState<UserValues>(initialUserConfig);
  const [layerIdx, setLayerIdx] = useState<number>(BASE_LAYER_IDX);

  const layerValues = useMemo(
    () => userValues[layerIdx],
    [layerIdx, userValues]
  );
  const setLayerValues = useCallback(
    (newConfig: Partial<ValueConfig>) => {
      setUserValues((oldConfig) => {
        const configCopy = [...oldConfig];
        configCopy[layerIdx] = newConfig;
        return configCopy;
      });
    },
    [layerIdx]
  );

  const resetAll = useCallback(() => setUserValues(initialUserConfig), []);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<ImageData[]>(defaultImages);
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null);
  const downloadImgButtonRef = useRef<HTMLAnchorElement>(null);

  const onFinishRender = useCallback(
    (caman: CamanInstance) => {
      const downloadButton = downloadImgButtonRef.current;
      if (downloadButton && currentImage) {
        downloadButton.href = caman.toBase64();
        downloadButton.download = `${currentImage.name}-${Date.now()}.png`;
        setIsLoading(false);
      }
    },
    [currentImage]
  );

  const handleButtonClick = useCallback(() => {
    if (currentImage && window?.Caman) {
      setIsLoading(true);

      window.Caman(`#target`, currentImage.src, function () {
        editImage(this, userValues, () => onFinishRender(this));
      });
    }
  }, [currentImage, userValues, onFinishRender]);

  function changeImage(newImg: ImageData) {
    const canv = document.getElementById(canvasId);
    canv?.removeAttribute("data-caman-id");
    setCurrentImage(newImg);
  }

  // when image changes, apply effects from config
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentImage.src} width={300} alt={currentImage.name} />
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
            images={images}
            userConfig={layerValues}
            setConfig={setLayerValues}
            resetAllUserConfigs={resetAll}
            layerIdx={layerIdx}
            setLayerIdx={setLayerIdx}
          />
        </Col>
        <Col span={24} style={{ flexWrap: "wrap" }}>
          <ImageGallery
            images={images}
            setImages={setImages}
            changeImage={changeImage}
          />
        </Col>
      </Row>
    </div>
  );
}
