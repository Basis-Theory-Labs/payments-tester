import axios from "axios";
import { Setting } from "@/server/settings";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

const fetchSettings = async () => {
  const { data } = await axios.get(`/api/settings`);
  return data;
};

const putSettingValue = async (setting: Setting, value: string) => {
  await axios.put(`/api/settings/${setting}`, {
    value,
  });
};

type Settings = { [key in Setting]?: string };

type DispatchSetting = (setting: Setting, value: string) => Promise<void>;

const SettingsContext = createContext<[Settings, DispatchSetting]>([
  {},
  async () => {},
]);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const [settingsState, setSettingsState] = useState<Settings>({});

  useEffect(() => {
    fetchSettings().then(setSettingsState);
  }, []);

  const setSetting = async (setting: Setting, value: string) => {
    setSettingsState((prev) => ({ ...prev, [setting]: value }));
    await putSettingValue(setting, value);
  };

  return (
    <SettingsContext.Provider value={[settingsState, setSetting]}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSetting = (setting: Setting) => {
  const [settings, dispatchSetting] = useContext(SettingsContext);

  const settingValue = settings[setting] || "";

  const setSettingValue = (value: string) => dispatchSetting(setting, value);

  return [settingValue, setSettingValue] as const;
};
