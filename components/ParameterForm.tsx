import {
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { filterArgConfig, ValueConfig } from "../config/filters";
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Typography,
} from "antd";
import debounce from "lodash.debounce";
import { DynamicField } from "./DynamicField";
import {
  ConfigStorage,
  deleteConfigs,
  getAllConfigs,
  saveConfig,
} from "../store/config";
import { CopyOutlined } from "@ant-design/icons";
import { sanitize } from "./utils/Sanitize";
import { displayError } from "./utils/displayError";
import { editAndDownload } from "./utils/editAndDownload";
import pLimit from "p-limit";
import { ImageData } from "./ImageEditor";

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 18 },
};

type ParameterFormProps = {
  downloadImgButtonRef: RefObject<HTMLAnchorElement>;
  userConfig: Partial<ValueConfig>;
  setConfig: Dispatch<SetStateAction<Partial<ValueConfig>>>;
  images: ImageData[];
};

export const ParameterForm: FC<ParameterFormProps> = ({
  userConfig,
  setConfig,
  downloadImgButtonRef,
  images,
}) => {
  const [configs, setConfigs] = useState<ConfigStorage>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [configName, setConfigName] = useState<string>("");

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
    setConfig({});
  };

  const onDownloadAll = async () => {
    const limit = pLimit(5);
    const promises = images.map(({ name, src }) =>
      limit(() => editAndDownload(name, src, userConfig))
    );
    try {
      const res = await Promise.all(promises);
      notification.success({ message: "Successfully downloaded all images" });
    } catch (e) {
      displayError();
    }
  };

  return (
    <>
      <Form
        {...layout}
        form={form}
        name="control-hooks"
        onValuesChange={debounce((field, all) => onFinish(all), 200)}
      >
        {Object.entries(filterArgConfig).map(([name, config]) => {
          if (Array.isArray(config)) {
            //
          } else if (config === "object") {
          } else
            return (
              <DynamicField
                name={name}
                config={config}
                value={userConfig[name]}
              />
            );
        })}
        <Form.Item {...tailLayout}>
          <Space direction={"vertical"}>
            {Object.keys(configs).length ? (
              <Space>
                Apply saved configurations:{" "}
                <Space>
                  {Object.entries(configs).map(([name, config]) => (
                    <Button
                      key={name}
                      onClick={() => {
                        form.resetFields();
                        setConfig(configs[name]);
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
              <Space>
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
                <Button onClick={onDownloadAll}>Download All</Button>
                <Button
                  onClick={() => {
                    const success = deleteConfigs();
                    if (success) {
                      notification.success({
                        message: "Configurations deleted successfully",
                      });
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
