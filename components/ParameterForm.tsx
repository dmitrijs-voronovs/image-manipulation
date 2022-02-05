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
import { debounce } from "lodash";
import { convertFormValuesToConfig } from "./utils/valueConverter";

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

const defaultConfig: Partial<ValueConfig> = {};

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
    console.log({ val, all });

    convertFormValuesToConfig(all);
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
