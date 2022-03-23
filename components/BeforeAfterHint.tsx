import { FC, useState } from "react";
import { Popover } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

export const BeforeAfterHint: FC<{ name: string }> = ({ name }) => {
  const [isError, setIsError] = useState(false);

  const content = (
    <div>
      {isError ? (
        "Image not specified"
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          onError={() => setIsError(true)}
          alt={name}
          src={`${name}.png`}
          width={250}
          height={500}
        />
      )}
    </div>
  );

  return (
    <Popover content={content} placement={"left"} title={`Filter for ${name}`}>
      <QuestionCircleOutlined />
    </Popover>
  );
};
