/* eslint-disable no-bitwise */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Platform,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import BleManager, {
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  type Characteristic,
  type Peripheral,
  type Service,
} from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const handleAndroidPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);
    if (
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.debug(
        '[handleAndroidPermissions] User accepts runtime permissions android 12+'
      );
      return true;
    }
    console.error(
      '[handleAndroidPermissions] User refuses runtime permissions android 12+'
    );
  } else if (Platform.OS === 'android' && Platform.Version >= 23) {
    const checkResult = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (checkResult) {
      console.debug(
        '[handleAndroidPermissions] runtime permission Android <12 already OK'
      );
      return true;
    }
    const requestResult = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    if (requestResult) {
      console.debug(
        '[handleAndroidPermissions] User accepts runtime permission android <12'
      );
      return true;
    }
    console.error(
      '[handleAndroidPermissions] User refuses runtime permission android <12'
    );
  }
  return false;
};

// const sendEvent = async (name: string, payload = {}) => {
//   const data = {
//     data: [
//       {
//         event_name: name,
//         event_category: 'ble',
//         payload,
//         ts: new Date(),
//       },
//     ],
//   };
//   await sendZoomEventsAPI(data);
// };

const useWeightScale = (
  params: { unit: string },
  onMeasured: (_w: number) => void,
  onError?: (error: any) => void
) => {
  const [isBleInitialized, setIsBleInitialized] = useState(false);
  // const [isBleEnabled, setIsBleEnabled] = useState(false);
  const dataPosted = useRef(false);
  const lastScannedTs = useRef(0);

  // const devices = [];

  const handleDiscoverPeripheral = useCallback(
    (peripheral: Peripheral) => {
      const postData = (kg: number, lb: number) => {
        if (!dataPosted.current) {
          if (params.unit === 'kg') {
            onMeasured(kg);
          } else {
            onMeasured(lb);
          }
          dataPosted.current = true;
        }
      };

      // if (!devices.includes(peripheral.id)) {
      //   devices.push(peripheral.id);
      //   console.log('added', peripheral.id);
      // }
      // if (peripheral.id === '28:29:47:2D:33:6B') {
      //   console.log(peripheral.advertising?.manufacturerRawData);
      // }
      if (peripheral.advertising?.manufacturerRawData) {
        const payloadRaw = peripheral.advertising?.manufacturerRawData;

        const payload: number[] =
          Platform.OS === 'ios' && payloadRaw?.bytes.length === 15
            ? [0x10, 0xff, ...payloadRaw?.bytes]
            : payloadRaw?.bytes || [];
        // console.log(
        //   '[handleDiscoverPeripheral] new BLE peripheral=',
        //   peripheral.name,
        //   peripheral.advertising.manufacturerData
        // );
        if (
          payload &&
          payload[0] === 0x10 &&
          payload[1] === 0xff &&
          payload[2] === 0xc0
        ) {
          // console.log(payload?.slice(0, 17)?.map((e, i) => `[${i}]: 0x${e.toString(16)}`)?.join(' '));
          const decimal = (payload[10] & 0x06) >> 1; // mask for decimal bit_1,bit_2
          const dataLock = payload[10] & 0x01; // mask for bit_0;
          if (dataLock !== 1) {
            dataPosted.current = false;
            return;
          }
          let factor = 10.0;
          if (decimal === 1) {
            factor = 1.0;
          } else if (decimal === 2) {
            factor = 100.0;
          }
          const unitBit = (payload[10] & 0x18) >> 3;
          if (unitBit === 0) {
            // kg
            const weight = (payload[4] << 8) + payload[5];
            const kg = weight / factor;
            const lb = Math.round(weight * 2.20462) / factor;
            postData(kg, lb);
            // stopScan();
          } else if (unitBit === 2) {
            // lb
            const weight = (payload[4] << 8) + payload[5];
            const kg = Math.round(weight * 0.453592) / factor;
            const lb = weight / factor;
            postData(kg, lb);
            // stopScan();
          }
        }
      }
    },
    [dataPosted, onMeasured, params.unit]
  );

  const scan = useCallback(
    async (timeout = 60) => {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const permissionResult = await handleAndroidPermissions();
        if (!permissionResult) {
          onError?.({ reason: 'permission_denied' });
          return;
        }
      }
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral
      );
      BleManager.scan([], timeout, false, {
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      })
        .then(() => {
          // sendEvent('scan_started');
          console.debug('[startScan] scan promise returned successfully.');
        })
        .catch((err: any) => {
          onError?.(err);
          console.error('[startScan] ble scan returned in error', err);
        });
    },
    [handleDiscoverPeripheral, onError]
  );

  const stopScan = useCallback(() => {
    console.log('stop scan');
    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    bleManagerEmitter.removeAllListeners(
      'BleManagerDidUpdateValueForCharacteristic'
    );
    BleManager.stopScan().then(() => {
      setIsBleInitialized(false);
      console.log('scan stopped');
      // sendEvent('scan_stopped');
    });
  }, []);

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false })
        .then(() => {
          setIsBleInitialized(true);
          console.debug('BleManager started.');
        })
        .catch((error: any) => {
          setIsBleInitialized(false);
          console.error('BeManager could not be started.', error);
        });
    } catch (error) {
      setIsBleInitialized(false);
      console.error('unexpected error starting BleManager.', error);
    }

    return () => {
      stopScan();
    };
  }, [stopScan]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBleInitialized) {
        if (new Date().getTime() - lastScannedTs.current > 5000) {
          scan();
        }
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [isBleInitialized, scan]);
};

const useThermometer = (
  params: { unit: string; deviceNames?: string[] },
  onMeasured: (_w: number) => void,
  onStateChanged?: (state: any) => void,
  onError?: (error: any) => void
) => {
  const [isBleInitialized, setIsBleInitialized] = useState(false);
  // const [isBleEnabled, setIsBleEnabled] = useState(false);
  const isConnecting = useRef(false);
  const isConnected = useRef(false);
  const connectedDeviceName = useRef<string | undefined>();
  const dataPosted = useRef(false);
  const lastScannedTs = useRef(0);

  const connectDevice = useCallback(
    async (peripheral: Peripheral) => {
      try {
        if (isConnecting.current || isConnected.current) return;
        console.log('Connect ', peripheral);
        isConnecting.current = true;
        await new Promise((f) => setTimeout(f, 1000));
        await BleManager.connect(peripheral.id);
        await new Promise((f) => setTimeout(f, 1000));
        isConnecting.current = false;
        isConnected.current = true;
        connectedDeviceName.current = peripheral.name;
        onStateChanged?.({ state: 'connected' });

        const peripheralData = await BleManager.retrieveServices(peripheral.id);
        if (peripheralData.characteristics) {
          peripheralData.characteristics.forEach(
            (characteristic: Characteristic) => {
              if (
                characteristic.properties.Notify &&
                !characteristic.properties.Read
              ) {
                BleManager.startNotification(
                  peripheral.id,
                  characteristic.service,
                  characteristic.characteristic
                )
                  .then(() => {
                    console.log('Notification started ', characteristic);
                  })
                  .catch((e: any) => {
                    onError?.(e);
                    console.error(e);
                  });
              }
            }
          );
        }
      } catch (e) {
        onError?.(e);
        isConnecting.current = false;
        isConnected.current = false;
        connectedDeviceName.current = undefined;
        console.error(e);
      }
    },
    [onError, onStateChanged]
  );

  const addOrUpdatePeripheral = useCallback(
    (peripheral: Peripheral) => {
      // setPeripherals((map) => map.set(peripheral.id, peripheral));
      lastScannedTs.current = new Date().getTime();
      // if (peripheral.advertising.isConnectable) {
      //   console.log({ device: JSON.stringify(peripheral) });
      // }
      if (
        peripheral.name &&
        params.deviceNames?.includes(peripheral.name) &&
        peripheral.advertising.isConnectable
      ) {
        connectDevice(peripheral);
      }
    },
    [connectDevice, params.deviceNames]
  );

  const handleDisconnectedPeripheral = useCallback(
    (event: { peripheral: Peripheral }) => {
      isConnected.current = false;
      connectedDeviceName.current = undefined;
      onStateChanged?.({ status: 'disconnected' });
    },
    [onStateChanged]
  );

  const handleUpdateValueForCharacteristic = useCallback(
    ({
      value,
      peripheral,
      characteristic,
      service,
    }: {
      value: number[];
      peripheral: string;
      characteristic: Characteristic;
      service: Service;
    }) => {
      console.debug(
        `[handleUpdateValueForCharacteristic] received data from ${peripheral} ${peripheral}
      characteristic=${characteristic}, service=${service}
      value=${value.map((n: number) => n.toString(16)).join(' ')}`
      );
      // Thermometer
      const postData = (temp: number, unit: string) => {
        let cel = temp;
        let far = temp;
        if (unit === 'C') {
          cel = temp / 100.0;
          far = ((temp / 100.0) * 9) / 5 + 32;
        }
        if (unit === 'F') {
          far = temp / 100.0;
          cel = ((temp / 100.0 - 32) * 5) / 9;
        }
        console.log(`accuracy=${value[1]}, cel=${cel}, far=${far}`);
        if (!dataPosted.current) {
          if (params.unit === 'C') {
            onMeasured(cel);
          } else {
            onMeasured(far);
          }
          dataPosted.current = true;
        }
      };
      // DMT-4735b
      if (connectedDeviceName.current === 'DMT-4735b') {
        // const accuracy = (0x80 & value[7]) >> 7;
        // const range = (0x40 & value[7]) >> 6;
        const temp = ((0x3f & value[7]) << 8) + value[8];
        // console.log(`accuracy=${accuracy}, range=${range}, temp=${temp}`);
        postData(temp, 'C');
      }
      // T28L-BT
      if (connectedDeviceName.current === 'T28L-BT') {
        const temp = (value[4] << 8) + value[5];
        if (value[2] === 0x1a) {
          postData(temp, 'C');
        } else {
          postData(temp, 'F');
        }
      }
      // AOJ-25A
      if (connectedDeviceName.current === 'AOJ-25A') {
        const temp = (value[2] << 8) + value[1];
        if (value[0] === 0x05) {
          postData(temp, 'F');
        } else {
          postData(temp, 'C');
        }
      }
    },
    [onMeasured, params.unit]
  );

  const scan = useCallback(
    async (timeout = 60) => {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const permissionResult = await handleAndroidPermissions();
        if (!permissionResult) {
          onError?.({ reason: 'permission_denied' });
          return;
        }
      }
      bleManagerEmitter.addListener(
        'BleManagerDiscoverPeripheral',
        addOrUpdatePeripheral
      );
      bleManagerEmitter.addListener(
        'BleManagerDisconnectPeripheral',
        handleDisconnectedPeripheral
      );
      bleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic',
        handleUpdateValueForCharacteristic
      );
      BleManager.scan([], timeout, false, {
        matchMode: BleScanMatchMode.Sticky,
        scanMode: BleScanMode.LowLatency,
        callbackType: BleScanCallbackType.AllMatches,
      })
        .then(() => {
          // sendEvent('scan_started');
          console.debug('[startScan] scan promise returned successfully.');
        })
        .catch((err: any) => {
          onError?.(err);
          console.error('[startScan] ble scan returned in error', err);
        });
    },
    [
      addOrUpdatePeripheral,
      handleDisconnectedPeripheral,
      handleUpdateValueForCharacteristic,
      onError,
    ]
  );

  const stopScan = useCallback(() => {
    console.log('stop scan');
    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    bleManagerEmitter.removeAllListeners(
      'BleManagerDidUpdateValueForCharacteristic'
    );
    BleManager.stopScan().then(() => {
      setIsBleInitialized(false);
      console.log('scan stopped');
      // sendEvent('scan_stopped');
    });
  }, []);

  useEffect(() => {
    try {
      BleManager.start({ showAlert: false })
        .then(() => {
          setIsBleInitialized(true);
          console.debug('BleManager started.');
        })
        .catch((error: any) => {
          setIsBleInitialized(false);
          console.error('BeManager could not be started.', error);
        });
    } catch (error) {
      setIsBleInitialized(false);
      console.error('unexpected error starting BleManager.', error);
    }

    return () => {
      stopScan();
    };
  }, [stopScan]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBleInitialized) {
        if (new Date().getTime() - lastScannedTs.current > 5000) {
          scan();
        }
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [isBleInitialized, scan]);
};

export { useWeightScale, useThermometer };
