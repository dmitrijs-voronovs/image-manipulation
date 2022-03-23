import { FC } from "react";
import { BeforeAfterHint } from "./BeforeAfterHint";

export const Label: FC<{ name: string }> = ({ name }) => {
  return (
    <p>
      {name} <BeforeAfterHint name={name} />
    </p>
  );
};
