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
  Divider,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  notification,
  Radio,
  Space,
  Typography,
} from "antd";
import {
  ConfigStorage,
  deleteConfigs,
  getAllConfigs,
  saveConfig,
} from "../store/config";
import { CopyOutlined, DownOutlined, EditOutlined } from "@ant-design/icons";
import { sanitize } from "./utils/Sanitize";
import { displayError } from "./utils/displayError";
import { downloadImagesInBulks } from "./utils/editAndDownload";
import { ValueConfig } from "../config/valueConfig";
import { FormFields } from "./FormFields";
import { debounce } from "lodash";
import { convertFormValuesToConfig } from "./utils/valueConverter";
import {
  defaultUserValue,
  filterArgLayerConfig,
  filterArgMainConfig,
} from "../config/filterArgConfig";
import { BASE_LAYER_IDX } from "./utils/layerConfig";
import { ImageData } from "./utils/imageConfig";
import { UserValues } from "./ImageEditor";
import { saveNumberOfLayers } from "../store/layers";
import { ImageScaleSlider } from "./ImageScaleSlider";
import { setTargetImageScale } from "./utils/setTargetImageScale";

export const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

export const tailLayout = {
  wrapperCol: { offset: 4, span: 18 },
};

type ParameterFormProps = {
  downloadImgButtonRef: RefObject<HTMLAnchorElement>;
  layerValues: Partial<ValueConfig>;
  setLayerValues: Dispatch<SetStateAction<Partial<ValueConfig>>>;
  images: ImageData[];
  resetAllLayers: () => void;
  layerIdx: number;
  setLayerIdx: Dispatch<SetStateAction<number>>;
  userValues: UserValues;
  additionalLayerCount: number;
  setAdditionalLayerCount: Dispatch<SetStateAction<number>>;
};

export const ParameterForm: FC<ParameterFormProps> = ({
  layerValues,
  setLayerValues,
  downloadImgButtonRef,
  images,
  resetAllLayers,
  layerIdx,
  setLayerIdx,
  userValues,
  additionalLayerCount,
  setAdditionalLayerCount,
}) => {
  const [configs, setConfigs] = useState<ConfigStorage>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [configName, setConfigName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    const success = saveConfig(configName, layerValues);
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

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(layerValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layerIdx, form]);

  const onFinish = (values: any) => {
    setLayerValues(values);
  };

  const onResetLayer = () => {
    form.resetFields();
    setLayerValues(defaultUserValue);
  };

  const onResetAll = () => {
    form.resetFields();
    resetAllLayers();
  };

  const handleAddLayersClick = (e: { key: string }) => {
    const addtionalLayers = Number(e.key);
    setAdditionalLayerCount(addtionalLayers);
    saveNumberOfLayers(addtionalLayers);
  };

  const onChange = (_val: Partial<ValueConfig>, all: Partial<ValueConfig>) => {
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
        <Divider orientation={"center"}>Filter configuration</Divider>

        <FormFields
          optionConfig={filterArgMainConfig}
          userValues={layerValues}
        />
        {layerIdx !== BASE_LAYER_IDX && (
          <>
            <Divider orientation={"center"}>Layer configuration</Divider>
            <FormFields
              optionConfig={filterArgLayerConfig}
              userValues={layerValues}
            />
          </>
        )}
        <Divider orientation={"center"}>Actions</Divider>
        <Form.Item label={"Layers"}>
          <Space wrap size={"middle"}>
            <Radio.Group
              onChange={(e) => setLayerIdx(e.target.value)}
              value={layerIdx}
            >
              <Radio.Button key={BASE_LAYER_IDX} value={BASE_LAYER_IDX}>
                Base layer
              </Radio.Button>
              {Array.from({ length: additionalLayerCount }).map((_, i) => (
                <Radio.Button key={i + 1} value={i + 1}>
                  Layer {i + 1}
                </Radio.Button>
              ))}
            </Radio.Group>
            <Dropdown
              overlay={
                <Menu onClick={handleAddLayersClick}>
                  <Menu.Item key="0">0 layers</Menu.Item>
                  <Menu.Item key="1">1 layer</Menu.Item>
                  <Menu.Item key="2">2 layers</Menu.Item>
                  <Menu.Item key="3">3 layers</Menu.Item>
                </Menu>
              }
            >
              <Button>
                <EditOutlined />
                <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Form.Item>
        {Object.keys(configs).length ? (
          <Form.Item label={"Apply saved configs"}>
            <Space wrap size={"middle"}>
              {Object.entries(configs).map(([name, config]) => (
                <Button
                  key={name}
                  onClick={() => {
                    form.resetFields();
                    form.setFieldsValue(config);
                    setLayerValues(config);
                  }}
                >
                  {name}
                </Button>
              ))}
            </Space>
          </Form.Item>
        ) : null}
        <Form.Item label={"Config actions"}>
          <Space wrap size={"middle"}>
            <Button onClick={showModal}>Save</Button>
            <Button
              onClick={async () => {
                try {
                  await window?.navigator.clipboard.writeText(
                    JSON.stringify(layerValues, null, 2)
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
                    if (typeof obj === "object") setLayerValues(obj);
                  }
                } catch (e) {
                  displayError();
                }
              }}
            >
              Paste <CopyOutlined />
            </Button>
            <Button htmlType="button" onClick={onResetLayer}>
              Reset Layer
            </Button>
            <Button htmlType="button" onClick={onResetAll}>
              Reset All
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
              Delete all
            </Button>
          </Space>
        </Form.Item>
        <Form.Item label={"Image download"}>
          <Space wrap size={"middle"}>
            <Button>
              <a ref={downloadImgButtonRef}>Download</a>
            </Button>
            <Button
              loading={isLoading}
              onClick={async () => {
                setIsLoading(true);
                await downloadImagesInBulks(images, userValues);
                setIsLoading(false);
              }}
            >
              Download All
            </Button>
          </Space>
        </Form.Item>
        <Form.Item key={"target-image-scale"} label={"Target image scale"}>
          <ImageScaleSlider onAfterChange={setTargetImageScale} />
        </Form.Item>
      </Form>
      <Modal
        title="Save layer configuration"
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
            min={5}
            placeholder={"config name"}
            autoFocus
          />
        </p>
        <p>Layer configuration:</p>
        <Typography.Text>
          <pre style={{ overflowX: "scroll", maxHeight: "300px" }}>
            {JSON.stringify(layerValues, null, 2)}
          </pre>
        </Typography.Text>
      </Modal>
    </>
  );
};
