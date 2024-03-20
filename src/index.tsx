import React from 'react';
import { NativeModules, Platform } from 'react-native';

import * as BluetoothConnectors from './BluetoothConnector';
import GlucoseGraph from './GlucoseGraph';
import WeightGraph from './WeightGraph';
export { BluetoothConnectors, GlucoseGraph, WeightGraph };

export type ProviderProp = {
  apiKey: string;
  baseUrl: string;
  accessToken: string;
};

export const ApiContext = React.createContext<ProviderProp>({
  apiKey: '',
  baseUrl: '',
  accessToken: '',
});

export function ApiProvider({
  children,
  apiKey,
  baseUrl,
  accessToken,
}: ProviderProp & { children: React.ReactElement | React.ReactElement[] }) {
  return (
    <ApiContext.Provider value={{ apiKey, baseUrl, accessToken }}>{children}</ApiContext.Provider>
  );
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
