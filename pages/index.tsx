import type {NextPage} from 'next'
import Head from 'next/head'
import {Button, Col, Form, Input, Row, Slider, Space, Switch} from "antd";
import {Dispatch, FC, RefObject, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import Image from 'next/image';
import debounce from 'lodash.debounce';
import {CamanInstance} from '../types/Caman';

type FilterArgNumber = {
    min: number, max: number, default?: number
};
type FilterArgString = { default?: string };
type FilterArgBool = { default?: boolean };

type FilterArg = FilterArgNumber | FilterArgString | FilterArgBool

type FilterArgs = FilterArg | FilterArg[] | Record<string, FilterArg>

export interface FilterArgConfig extends Record<string, FilterArgs> {
    brightness: FilterArgNumber,
    channels: {
        red: FilterArgNumber, green: FilterArgNumber, blue: FilterArgNumber,
    },
    clip: FilterArgNumber,
    colorize: [FilterArgString, FilterArgNumber]
    contrast: FilterArgNumber,
    exposure: FilterArgNumber,
    fillColor: FilterArgString
    gamma: FilterArgNumber
    greyscale: FilterArgBool
    hue: FilterArgNumber,
    invert: FilterArgBool,
    noise: FilterArgNumber,
    saturation: FilterArgNumber,
    sepia: FilterArgNumber,
    vibrance: FilterArgNumber,
    stackBlur: FilterArgNumber,
}

const delta200: FilterArgNumber = {
    min: -100, max: 100, default: 0
};
const delta100: FilterArgNumber = {
    min: 0, max: 100, default: 0
};

const filterArgConfig: FilterArgConfig = {
    brightness: delta200, channels: {
        red: delta200, green: delta200, blue: delta200
    }, clip: delta100, colorize: [{default: ''}, delta100], contrast: delta200, exposure: delta200, // TODO: add filter arg
    fillColor: {default: ''}, gamma: {
        min: 0, max: 5, default: 1,
    }, greyscale: {default: false}, hue: delta100, invert: {default: false}, noise: {
        min: 0, max: 100, default: 0
    }, saturation: delta200, sepia: delta100, vibrance: delta200, stackBlur: {
        min: 0, max: 50, default: 0
    },
}

function getDefaultFilterValue(filter1: string) {
    const filter = filterArgConfig[filter1];
    if (Array.isArray(filter)) {
        return filter.map(val => val.default);
    }

    return filter.default;
}

type ValueConfig = {
    [Key in keyof FilterArgConfig]: FilterArgConfig[Key] extends Array<FilterArg> ? NonNullable<FilterArg['default']>[] : FilterArgConfig[Key] extends FilterArg ? NonNullable<FilterArgConfig[Key]['default']> : FilterArgConfig[Key] extends Record<string, FilterArg> ? { [ObjKey in keyof FilterArgConfig[Key]]: NonNullable<FilterArgConfig[Key][ObjKey]['default']> } : unknown
}

const layout = {
    labelCol: {span: 4}, wrapperCol: {span: 18},
};

const tailLayout = {
    wrapperCol: {offset: 4, span: 18},
};

const DynamicField: FC<{ name: string, config: FilterArg, value: unknown }> = ({name, config, value}) => {
    const argConfig = filterArgConfig[name];
    if (typeof config.default === 'boolean') {
        return <Form.Item name={name} label={name} required={true}>
            <Switch
                defaultChecked={typeof value !== 'undefined' ? Boolean(value) : (argConfig as FilterArgBool).default}/>
        </Form.Item>
    }

    if (typeof config.default === 'string') {
        return <Form.Item name={name} label={name} required={true}>
            <Input type={"color"} defaultValue={String(value) || (argConfig as FilterArgString).default}/>
        </Form.Item>
    }

    if (typeof config.default === 'number') {
        const max = (argConfig as FilterArgNumber).max;
        const min = (argConfig as FilterArgNumber).min;
        const step = max / 100;
        // const marks = Array.from({length: max / 10}).map((a,i) => {
        //
        // })
        const total = min > max ? min - max : max - min;
        const markCount = 5;
        const markStep = total / markCount;
        const marks = Array.from({length: markCount - 1}).reduce<Record<string, string>>((acc, _, i) => {
            const relativeMarker = markStep * (i + 1);
            const marker = min < 0 ? relativeMarker + min : relativeMarker - min;
            acc[marker] = String(marker);
            return acc;
        }, {})
        return <Form.Item name={name} label={name}>
            <Slider min={min}
                    max={max}
                    defaultValue={Number(value) || (argConfig as FilterArgNumber).default}
                    step={step}
                    marks={marks}
            />
        </Form.Item>
    }

    return null;
}

const ParameterForm: FC<{ downloadImgButtonRef: RefObject<HTMLAnchorElement>, userValues: Partial<ValueConfig>, setConfig: Dispatch<SetStateAction<Partial<ValueConfig>>> }> = ({
                                                                                                                                                                                    userValues,
                                                                                                                                                                                    setConfig,
                                                                                                                                                                                    downloadImgButtonRef
                                                                                                                                                                                }) => {
    const [form] = Form.useForm<ValueConfig>();
    const onFinish = (values: any) => {
        console.log(values);
        setConfig(values);
    };

    const onReset = () => {
        form.resetFields();
        setConfig({})
    };

    return (
        <Form {...layout} form={form} name="control-hooks" onValuesChange={debounce((field, all) => onFinish(all), 200)}
        >
            {Object.entries(filterArgConfig).map(([name, config]) => {
                if (Array.isArray(config)) {
                    //
                } else if (config === 'object') {

                } else return <DynamicField name={name} config={config} value={userValues[name]}/>
            })}
            <Form.Item {...tailLayout}>
                <Button htmlType="button" onClick={onReset}>
                    Reset
                </Button>
                <Button>
                    <a ref={downloadImgButtonRef}>Download</a>
                </Button>
            </Form.Item>
        </Form>);
}

function PictureTest() {
    const [config, setConfig] = useState<Partial<ValueConfig>>({})
    const [isLoading ,setIsLoading]= useState<boolean>(false)
    const [currentImage, setCurrentImage] = useState<string>('');
    const imgId = `img${currentImage.slice(1, 3)}`;
    console.log({imgId})
    const downloadImgButtonRef = useRef<HTMLAnchorElement>(null);
    const camanRef = useRef<CamanInstance>();

    console.log({isLoading});
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

    return <Row style={{width: '100vw'}} align={"middle"} justify={"center"} gutter={48}>
        <Col xs={24} sm={12}>
            {currentImage ? <Space direction={"horizontal"}>
                <img src={currentImage} width={300}/>
                <canvas id={'target'}/>
            </Space> : <Space style={{textAlign: "center"}} align={"center"}>Please upload your images</Space>}
        </Col>
        <Col xs={24} sm={12}>
            <ParameterForm downloadImgButtonRef={downloadImgButtonRef} userValues={config} setConfig={setConfig}/>
        </Col>
        <Col span={24} style={{"flexWrap": "wrap"}}>
            {Array.from({length: 25}).map((_, i) => {
                const src = `/${i < 10 ? '0' + i : i}.jpg`;
                return <img style={{width: 100, height: 100}} key={src} alt={src} src={src}
                            onClick={() => changeImage(src)}/>
            })}
        </Col>
    </Row>;
}

const Home: NextPage = () => {
    return (<Space direction={"vertical"} style={{minHeight: "100vh"}}>
        <Head>
            <title>Image Processing</title>
            <meta name="description" content="Generated by create next app"/>
            <link rel="icon" href="/favicon.ico"/>
        </Head>

        <main>
            <Space style={{minHeight: "80vh", margin: 24}}>
                <PictureTest/>
            </Space>
        </main>

        <footer>
            Dmitrijs Voronovs
        </footer>
    </Space>)
}

export default Home
