import {Dispatch, FC, RefObject, SetStateAction} from "react";
import {filterArgConfig, ValueConfig} from "../config/filters";
import {Button, Form} from "antd";
import debounce from "lodash.debounce";
import {DynamicField} from "./DynamicField";

const layout = {
    labelCol: {span: 4}, wrapperCol: {span: 18},
};
const tailLayout = {
    wrapperCol: {offset: 4, span: 18},
};
export const ParameterForm: FC<{ downloadImgButtonRef: RefObject<HTMLAnchorElement>, userValues: Partial<ValueConfig>, setConfig: Dispatch<SetStateAction<Partial<ValueConfig>>> }> = ({
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