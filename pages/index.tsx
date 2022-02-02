import type {NextPage} from 'next'
import Head from 'next/head'
import {Button, Col, Form, Input, Row, Slider, Space, Switch} from "antd";
import {Dispatch, FC, SetStateAction, useCallback, useEffect, useState} from "react";
import debounce from 'lodash.debounce';

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
    brightness: delta200,
    channels: {
        red: delta200, green: delta200, blue: delta200
    },
    clip: delta100,
    colorize: [{default: '#ffffff'}, delta100],
    contrast: delta200,
    exposure: delta200, // TODO: add filter arg
    // fillColor: {default: '#ffffff'},
    // fillColor: {default: ''},
    gamma: {
        min: 0, max: 5, default: 1,
    },
    greyscale: {default: false},
    hue: delta100,
    invert: {default: false},
    noise: {
        min: 0, max: 100, default: 0
    },
    saturation: delta200,
    sepia: delta100,
    vibrance: delta200,
    stackBlur: {
        min: 0,
        max: 50,
        default: 0
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
    labelCol: {span: 8}, wrapperCol: {span: 16},
};

const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
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
        return <Form.Item name={name} label={name}>
            <Slider min={(argConfig as FilterArgNumber).min}
                    max={(argConfig as FilterArgNumber).max}
                    defaultValue={Number(value) || (argConfig as FilterArgNumber).default}
                // marks={{
                //     0: 'A',
                //     20: 'B',
                //     40: 'C',
                //     60: 'D',
                //     80: 'E',
                //     100: 'F',
                // }}
            />
        </Form.Item>
    }

    return null;
}

const ParameterForm: FC<{ userValues: Partial<ValueConfig>, setConfig: Dispatch<SetStateAction<Partial<ValueConfig>>> }> = ({
                                                                                                                                userValues,
                                                                                                                                setConfig
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

    return (<Form {...layout} form={form} name="control-hooks" onValuesChange={debounce((field, all) => onFinish(all), 200)} onFinish={onFinish}>
    {/*return (<Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>*/}
        {/*<Form.Item name="switch" label="Switch" required={true}>*/}
        {/*    <Switch/>*/}
        {/*</Form.Item>*/}
        {/*<Form.Item name="slider" label="Slider">*/}
        {/*    <Slider*/}
        {/*        // marks={{*/}
        {/*        //     0: 'A',*/}
        {/*        //     20: 'B',*/}
        {/*        //     40: 'C',*/}
        {/*        //     60: 'D',*/}
        {/*        //     80: 'E',*/}
        {/*        //     100: 'F',*/}
        {/*        // }}*/}
        {/*    />*/}
        {/*</Form.Item>*/}
        {Object.entries(filterArgConfig).map(([name, config]) => {
            if (Array.isArray(config)) {
                //
            } else if (config === 'object') {

            } else return <DynamicField name={name} config={config} value={userValues[name]}/>
        })}
        <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
                Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
                Reset
            </Button>
            {/*<Button type="link" htmlType="button" onClick={onFill}>*/}
            {/*    Fill form*/}
            {/*</Button>*/}
        </Form.Item>
    </Form>);
}

function PictureTest() {
    const [config, setConfig] = useState<Partial<ValueConfig>>({})
    const handleButtonClick = useCallback(() => {
        if (window?.Caman) {
            window.Caman("#img1", function () {
                this.reset();
                console.log(this);

                Object.entries(config).forEach(([filter, rawVal]) => {
                    const val = rawVal ?? getDefaultFilterValue(filter)
                    if (Array.isArray(val)) {
                        console.log('arr', val);
                        this[filter](...val)
                    } else if (typeof val === 'boolean') {
                        if (val) this[filter]();
                    } else {
                        console.log('val', val);
                        this[filter](val)
                    }
                })
                // this.invert(true);

                this.render();

                // this.brightness(10).contrast(20).noise(50).render(function () {
                //     alert("Done!");
                // });
                // this.newLayer(function () {
                //     // There are many blending modes, more below.
                //     this.setBlendingMode('multiply');
                //     this.opacity(10);
                //     this.copyParent();
                //
                //     this.filter.gamma(0.8);
                //     this.filter.contrast(50);
                //
                //     /*
                //      * Yep, you can stack multiple layers! The further a layer is nested, the higher up on the layer
                //      * stack it will be.
                //      */
                //     this.newLayer(function () {
                //         this.setBlendingMode('softLight');
                //         this.opacity(10);
                //         this.fillColor('#f49600');
                //     });
                //
                //     this.filter.exposure(10);
                // });
                // this.newLayer(function () {
                //     this.setBlendingMode('softLight');
                //     this.opacity(50);
                //
                //     this.overlayImage('/02.jpg');
                // });
                //
                // this.exposure(20);
                // this.gamma(0.8);
            })
        }
    }, [config])

    useEffect(() => {
        handleButtonClick();
    }, [config, handleButtonClick])

    return <Row style={{width: '100vw'}} align={"middle"} justify={"center"} gutter={48}>
        <Col xs={24} sm={12}><Space direction={"vertical"}>
            <img src={"/01.jpg"}/>
            <img id={"img1"} data-caman="saturation(-80) brightness(90) vignette('10%')" src={"/01.jpg"}/>
        </Space></Col>
        <Col xs={24} sm={12}>
            <ParameterForm userValues={config} setConfig={setConfig}/>
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
