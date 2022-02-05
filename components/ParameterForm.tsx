import {
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Typography,
} from "antd";
import {
  ConfigStorage,
  deleteConfigs,
  getAllConfigs,
  saveConfig,
} from "../store/config";
import { CopyOutlined } from "@ant-design/icons";
import { sanitize } from "./utils/Sanitize";
import { displayError } from "./utils/displayError";
import { downloadImagesInBulks } from "./utils/editAndDownload";
import { ImageData } from "./ImageEditor";
import { ValueConfig } from "../config/valueConfig";
import { FormFields } from "./FormFields";
import { isValWithSwitch } from "./utils/isValWithSwitch";
import { getDefaultFilterValue } from "../config/utils/getDefaultFilterValue";
import { debounce, cloneDeep, merge } from "lodash";

export const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

export const tailLayout = {
  wrapperCol: { offset: 4, span: 18 },
};

type ParameterFormProps = {
  downloadImgButtonRef: RefObject<HTMLAnchorElement>;
  userConfig: Partial<ValueConfig>;
  setConfig: Dispatch<SetStateAction<Partial<ValueConfig>>>;
  images: ImageData[];
};

const defaultConfig: Partial<ValueConfig> = {
  // channels: {
  //   red: 0,
  //   green: 0,
  //   blue: 0,
  // },
};

export const ParameterForm: FC<ParameterFormProps> = ({
  userConfig,
  setConfig,
  downloadImgButtonRef,
  images,
}) => {
  const [configs, setConfigs] = useState<ConfigStorage>(defaultConfig);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [configName, setConfigName] = useState<string>("");

  console.log("config", userConfig);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    const success = saveConfig(configName, userConfig);
    if (success) {
      setConfigName("");
      notification.success({ message: "Configuration saved successfully" });
      setConfigs(getAllConfigs());
    } else {
      displayError();
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    setConfigs(getAllConfigs());
  }, []);

  const [form] = Form.useForm<ValueConfig>();
  const onFinish = (values: any) => {
    console.log(values);
    setConfig(values);
  };

  const onReset = () => {
    form.resetFields();
    // form.setFieldsValue({});
    setConfig(defaultConfig);
  };

  const onChange = (val: Partial<ValueConfig>, all: Partial<ValueConfig>) => {
    // const fieldName = Object.keys(val)[0];
    // const field = val[fieldName];
    // const defaultValue = getDefaultFilterValue(fieldName);
    // console.log({ val, all, defaultValue });
    console.log({ val, all });
    // if (Array.isArray(defaultValue)) {
    //   // if (isValWithSwitch(field)) {
    //   //
    //   // }
    //   if (!Array.isArray(all[fieldName])) {
    //     all[fieldName] = defaultValue;
    //   }
    //   Object.entries(field).forEach(([k, v]) => {
    //     all[fieldName][k] = v;
    //   });
    // } else if (typeof defaultValue === "object") {
    //   console.log(fieldName);
    //   all[fieldName] = field;
    // }

    function convertArrWithSwitch(val: any, def: any): any[] {
      const valCopy = cloneDeep(val);
      const res = cloneDeep(def);
      // switch value
      res[0] = valCopy[0];
      delete valCopy[0];
      if (Object.keys(valCopy).length === 1) {
        res[1][0] = Object.values(valCopy)[0];
      } else {
        Object.entries(valCopy).forEach(([k, v]) => {
          if (v) res[1][0][Number(k) - 1] = v;
        });
      }
      console.log("arr+Sw", val, def, res);
      return res;
    }

    function convertArr(value: Object, def: any): any[] {
      const res = cloneDeep(def);
      Object.entries(value).forEach(([k, v]) => {
        if (v) res[k] = v;
      });
      console.log("arr", value, def, res);
      return res;
    }

    Object.entries(all)
      .filter(([_, v]) => typeof v === "object")
      .forEach(([field, value]) => {
        const def = getDefaultFilterValue(field);
        console.log(def);
        if (Array.isArray(def)) {
          if (isValWithSwitch(value)) {
            all[field] = convertArrWithSwitch(value, def);
          } else {
            all[field] = convertArr(value, def);
          }
        } else {
          all[field] = merge(def, value);
        }
      });
    onFinish(all);
  };

  return (
    <>
      <Form
        {...formLayout}
        form={form}
        name="control-hooks"
        onValuesChange={debounce(onChange, 200)}
      >
        <FormFields config={userConfig} />
        <Form.Item {...tailLayout}>
          <Space direction={"vertical"}>
            {Object.keys(configs).length ? (
              <Space>
                Apply saved configurations:
                <Space wrap>
                  {Object.entries(configs).map(([name, config]) => (
                    <Button
                      key={name}
                      onClick={() => {
                        form.resetFields();
                        setConfig(config);
                      }}
                    >
                      {name}
                    </Button>
                  ))}
                </Space>
              </Space>
            ) : null}
            <Space>
              Configuration actions:{" "}
              <Space wrap>
                <Button onClick={showModal}>Save</Button>
                <Button
                  onClick={async () => {
                    try {
                      await window?.navigator.clipboard.writeText(
                        JSON.stringify(userConfig, null, 2)
                      );
                      notification.success({
                        message: "Configuration was copied to clipboard",
                      });
                    } catch (e) {
                      displayError();
                    }
                  }}
                >
                  Copy <CopyOutlined />
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const resultStr =
                        await window?.navigator.clipboard.readText();
                      if (resultStr) {
                        const sanitizedStr = sanitize(resultStr);
                        const obj = JSON.parse(sanitizedStr);
                        if (typeof obj === "object") setConfig(obj);
                      }
                    } catch (e) {
                      displayError();
                    }
                  }}
                >
                  Paste <CopyOutlined />
                </Button>
                <Button htmlType="button" onClick={onReset}>
                  Reset
                </Button>
                <Button>
                  <a ref={downloadImgButtonRef}>Download</a>
                </Button>
                <Button
                  onClick={() => downloadImagesInBulks(images, userConfig)}
                >
                  Download All
                </Button>
                <Button
                  onClick={() => {
                    const success = deleteConfigs();
                    if (success) {
                      notification.success({
                        message: "Configurations deleted successfully",
                      });
                      setConfigs({});
                    } else {
                      displayError();
                    }
                  }}
                >
                  Delete all saved
                </Button>
              </Space>
            </Space>
          </Space>
        </Form.Item>
      </Form>
      <Modal
        title="Save modal"
        visible={isModalVisible}
        onOk={handleOk}
        okButtonProps={configName ? {} : { disabled: true }}
        okText={"save"}
        onCancel={handleCancel}
      >
        <p>
          <p>Configuration name:</p>
          <Input
            type={"text"}
            value={configName}
            onInput={(val) =>
              setConfigName((val.target as HTMLInputElement).value)
            }
            required
            min={5}
            placeholder={"config name"}
            autoFocus
          />
        </p>
        <p>Configuration:</p>
        <Typography.Text>
          <pre>{JSON.stringify(userConfig, null, 2)}</pre>
        </Typography.Text>
      </Modal>
    </>
  );
};
