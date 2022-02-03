import { notification } from "antd";

export function displayError() {
  notification.error({ message: "Something went wrong" });
}
