import React from 'react';
import { NativeModules, Platform } from 'react-native';

export * as BluetoothConnectors from './BluetoothConnector';

export type ProviderProp = {
  children: React.ReactElement | React.ReactElement[];
  apiKey: string;
  baseUrl: string;
};

export const ApiContext = React.createContext<{ apiKey: string; baseUrl: string }>({
  apiKey: '',
  baseUrl: '',
});

export function ApiProvider({ children, apiKey, baseUrl }: ProviderProp) {
  return <ApiContext.Provider value={{ apiKey, baseUrl }}>{children}</ApiContext.Provider>;
}

const LINKING_ERROR =
  `The package 'ongo-react-native' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const OngoReactNative = NativeModules.OngoReactNative
  ? NativeModules.OngoReactNative
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );
