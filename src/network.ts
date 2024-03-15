import { useContext } from 'react';
import axios, { type InternalAxiosRequestConfig } from 'axios';

import { ApiContext } from './index';
import { camelCaseToSnakeCase, transformObjectKeys } from './helpers';

const paramsInterceptor = (config: InternalAxiosRequestConfig) => {
  if (config.params) {
    const newParams = transformObjectKeys(config.params, camelCaseToSnakeCase);
    config.params = newParams;
  }
  return config;
};

const createAxiosInstance = (apiKey: string, baseUrl: string) =>
  axios.create({
    baseURL: `${baseUrl}/api/v2`,
    headers: {
      common: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-app-version': 'ongo-sdk/1.0.0',
        'Accept-Language': 'en',
      },
    },
    timeout: 10000,
  });

const useOnGoApi = (accessToken: string) => {
  const context = useContext(ApiContext);
  const axiosInstance = createAxiosInstance(context.apiKey, context.baseUrl);
  axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });
  axiosInstance.interceptors.request.use(paramsInterceptor);
};

export { useOnGoApi };

// export { axiosInstanceNoBase, axiosInstanceRaw };
