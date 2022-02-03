import {ValueConfig} from "../config/filters";
import {useCallback, useEffect, useRef, useState} from "react";
import {CamanInstance} from "../types/Caman";
import {LoadingOutlined} from "@ant-design/icons";
import {Col, Row, Space} from "antd";
import {ParameterForm} from "./ParameterForm";
import {getDefaultFilterValue} from "../config/utils/getDefaultFilterValue";
import {ImageGallery} from "./ImageGallery";

export function ImageEditor() {
    const [config, setConfig] = useState<Partial<ValueConfig>>({})
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [currentImage, setCurrentImage] = useState<string>('');
    const imgId = `img${currentImage.slice(1, 3)}`;
    console.log({imgId})
    const downloadImgButtonRef = useRef<HTMLAnchorElement>(null);
    const camanRef = useRef<CamanInstance>();

    const handleButtonClick = useCallback(() => {
        if (currentImage && window?.Caman) {
            setIsLoading(true);
            camanRef.current = window.Caman(`#target`, currentImage, function () {
                // window.Caman(`#canvaa`, function () {
                this.reloadCanvasData();
                // this.reset();
                this.revert(false);
                console.log(this);

                // Event.types = ["processStart", "processComplete", "renderStart", "renderFinished", "blockStarted", "blockFinished"];

                Object.entries(config).forEach(([filter, rawVal]) => {
                    const val = rawVal ?? getDefaultFilterValue(filter)
                    if (Array.isArray(val)) {
                        console.log('arr', val);
                        this[filter](...val)
                    } else if (typeof val === 'boolean') {
                        if (val) this[filter]();
                    } else if (typeof val === 'string') {
                        if (val) this[filter](val);
                    } else {
                        console.log('val', val);
                        this[filter](val)
                    }
                })

                //
                // this.newLayer(function() {
                //
                //
                //     this.setBlendingMode('normal');
                //     this.opacity(50);
                //     this.overlayImage("/00.jpg")
                //     Object.entries(config).forEach(([filter, rawVal]) => {
                //         const val = rawVal ?? getDefaultFilterValue(filter)
                //         if (Array.isArray(val)) {
                //             console.log('arr', val);
                //             this.filter[filter](...val)
                //         } else if (typeof val === 'boolean') {
                //             if (val) this.filter[filter]();
                //         } else if (typeof val === 'string') {
                //             if (val) this.filter[filter](val);
                //         } else {
                //             console.log('val', val);
                //             this.filter[filter](val)
                //         }
                //     })
                //
                //     this.newLayer(function() {
                //
                //
                //         this.setBlendingMode('exclusion');
                //         this.opacity(50);
                //         this.overlayImage("/01.jpg")
                //         Object.entries(config).forEach(([filter, rawVal]) => {
                //             const val = rawVal ?? getDefaultFilterValue(filter)
                //             if (Array.isArray(val)) {
                //                 console.log('arr', val);
                //                 this.filter[filter](...val)
                //             } else if (typeof val === 'boolean') {
                //                 if (val) this.filter[filter]();
                //             } else if (typeof val === 'string') {
                //                 if (val) this.filter[filter](val);
                //             } else {
                //                 console.log('val', val);
                //                 this.filter[filter](val)
                //             }
                //         })
                //
                //         // this.fillColor('#f49600');
                //         // this.invert(true);
                //     })
                //
                //     // this.fillColor('#f49600');
                //     // this.invert(true);
                // })


                this.render(() => {
                    const downloadButton = downloadImgButtonRef.current;
                    if (downloadButton) {
                        downloadButton.href = this.toBase64();
                        downloadButton.download = Date.now() + 'img.png';
                        console.log(this.toBase64())
                        setIsLoading(false);
                    }
                });
            })
        }
    }, [config, currentImage])

    function changeImage(newSrc: string) {
        const canv = document.getElementById('target');
        canv?.removeAttribute('data-caman-id');
        setCurrentImage(newSrc);
    }

    useEffect(() => {
        handleButtonClick();
    }, [currentImage, handleButtonClick])

    return <div style={{position: "relative"}}>
        <div style={{position: "absolute", top: '50%', left: '50%'}}>{isLoading &&
            <LoadingOutlined style={{fontSize: "50px"}}/>}</div>
        <Row style={{width: '100vw'}} align={"middle"} justify={"center"} gutter={48}>
            <Col xs={24} sm={12}>
                {currentImage ? <Space direction={"horizontal"}>
                    <img src={currentImage} width={300}/>
                    <canvas id={'target'}/>
                </Space> : <Space style={{textAlign: "center"}} align={"center"}>Please select an image</Space>}
            </Col>
            <Col xs={24} sm={12}>
                <ParameterForm downloadImgButtonRef={downloadImgButtonRef} userConfig={config} setConfig={setConfig} />
            </Col>
            <Col span={24} style={{"flexWrap": "wrap"}}>
                <ImageGallery changeImage={changeImage}/>
            </Col>
        </Row></div>;
}