import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CamanInstance } from "../types/Caman";
import { LoadingOutlined } from "@ant-design/icons";
import { Divider, Space } from "antd";
import { ParameterForm } from "./ParameterForm";
import { ImageGallery } from "./ImageGallery";
import { editImage } from "./utils/editImage";
import { ValueConfig } from "../config/valueConfig";
import {
  BASE_LAYER_IDX,
  DEFAULT_N_OF_ADDITIONAL_LAYERS,
  getInitialUserConfig,
} from "./utils/layerConfig";
import { defaultImages, ImageData } from "./utils/imageConfig";
import { getNumberOfLayers } from "../store/layers";

const canvasId = "target";

export type UserValues = Partial<ValueConfig>[];

export function ImageEditor() {
  const [additionalLayerCount, setAdditionalLayerCount] = useState(
    DEFAULT_N_OF_ADDITIONAL_LAYERS
  );

  useEffect(() => {
    setAdditionalLayerCount(getNumberOfLayers());
  }, []);

  const [userValues, setUserValues] = useState<UserValues>(
    getInitialUserConfig(additionalLayerCount)
  );

  const [layerIdx, setLayerIdx] = useState<number>(BASE_LAYER_IDX);

  useEffect(() => {
    const baseLayer = 1;
    const diff = userValues.length - baseLayer - additionalLayerCount;
    const totalLayers = baseLayer + additionalLayerCount;
    const layerCountIncreased = diff < 0;
    if (layerCountIncreased) {
      setUserValues((userValues) => [
        ...userValues,
        ...getInitialUserConfig(Math.abs(diff)),
      ]);
    } else {
      if (layerIdx + 1 > totalLayers) {
        setLayerIdx(totalLayers - 1);
      }
      setUserValues((userValues) => userValues.slice(0, totalLayers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalLayerCount]);

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

  const resetAll = useCallback(
    () => setUserValues(getInitialUserConfig(additionalLayerCount)),
    [additionalLayerCount]
  );

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
          pointerEvents: "none",
          zIndex: 99,
        }}
      >
        {isLoading && (
          <div>
            <LoadingOutlined style={{ fontSize: "50px" }} />
          </div>
        )}
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: "0 0 50%",
            height: "100vh",
            padding: "15px",
          }}
        >
          {currentImage ? (
            <Space key={"canvas"} direction={"vertical"} size={"middle"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentImage.src} width={300} alt={currentImage.name} />
              <canvas id={canvasId} />
            </Space>
          ) : (
            <Space
              key={"empty"}
              direction={"vertical"}
              style={{
                fontSize: "1.2rem",
                width: "100%",
                height: "100%",
                position: "relative",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p>
                Please select an image on the right
                <br />
                or upload custom images
              </p>
            </Space>
          )}
        </div>
        <div
          style={{
            flex: "0 1 50%",
            overflowY: "scroll",
            height: "100vh",
            width: "50%",
            position: "absolute",
            right: "0",
            top: "0",
            padding: "0 15px",
            background: "#fffcf5e0",
          }}
        >
          <ParameterForm
            downloadImgButtonRef={downloadImgButtonRef}
            images={images}
            userValues={userValues}
            layerValues={layerValues}
            setLayerValues={setLayerValues}
            resetAllLayers={resetAll}
            layerIdx={layerIdx}
            setLayerIdx={setLayerIdx}
            additionalLayerCount={additionalLayerCount}
            setAdditionalLayerCount={setAdditionalLayerCount}
          />
          <Divider orientation={"center"}>Images</Divider>
          <ImageGallery
            images={images}
            setImages={setImages}
            changeImage={changeImage}
          />
        </div>
      </div>
    </div>
  );
}
