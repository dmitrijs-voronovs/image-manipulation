import { get, set } from "local-storage";
import { ValueConfig } from "../config/valueConfig";

const CONFIG_KEY = "CONFIG";

export type ConfigStorage = Record<string, Partial<ValueConfig>>;

export const getAllConfigs = () => get<ConfigStorage>(CONFIG_KEY) || {};

export const deleteConfigs = () => set<ConfigStorage>(CONFIG_KEY, {});

export const saveConfig = (name: string, config: Partial<ValueConfig>) => {
  const allConfigs = getAllConfigs();
  allConfigs[name] = config;
  return set<ConfigStorage>(CONFIG_KEY, allConfigs);
};
