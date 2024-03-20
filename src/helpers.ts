import * as DateFns from 'date-fns';

export const startOfHour = (date: Date) => {
  return new Date(Math.floor(date.getTime() / 3600 / 1000) * 3600 * 1000);
};

export const endOfHour = (date: Date) => {
  return new Date(Math.ceil(date.getTime() / 3600 / 1000) * 3600 * 1000);
};

export const getDifferenceInDays = (from: Date, to: Date) => {
  return DateFns.differenceInDays(from, to);
};

export const camelCaseToSnakeCase = (key: string) =>
  key.replace(/[A-Z]+/g, (substring) => `_${substring.toLowerCase()}`);

export const camelCaseToKebabCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export const snakeCaseToCamelCase = (key: string) =>
  key.replace(/[-_][A-Za-z0-9]/g, (substring) => `${substring[1].toUpperCase()}`);

export const transformObjectKeys = (obj: any, transformer: (_: string) => string): object => {
  if (typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((e) => transformObjectKeys(e, transformer));
  }
  const newObj: { [key: string | number]: any } = {};
  Object.keys(obj).forEach((key: string | number) => {
    const value = Object.getOwnPropertyDescriptor(obj, key)?.value;
    const newKey = typeof key === 'string' ? transformer(key) : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value instanceof Date) {
        newObj[newKey] = value.toISOString();
      } else {
        newObj[newKey] = transformObjectKeys(value, transformer);
      }
    } else if (Array.isArray(value)) {
      newObj[newKey] = obj[key].map((e: any) => transformObjectKeys(e, transformer));
    } else {
      newObj[newKey] = obj[key];
    }
  });
  return newObj;
};

export function responseInterceptor<T = any>(response: object): T {
  const transformed = transformObjectKeys(response, snakeCaseToCamelCase);
  return transformed as T;
}

export function iso8601ToFormatted(date: Date, format: string): string {
  return DateFns.format(date, format);
}
