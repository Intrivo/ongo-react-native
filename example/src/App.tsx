import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

import { ApiProvider } from '../../src';
import BluetoothTest from './BluetoothTest';

export default function App() {
  const [module, setModule] = useState<string>();

  return (
    <ApiProvider
      apiKey="ALPYPyCsgiAnJh9pG8MnU6Jw"
      baseUrl="https://dev.intrivo.com"
    >
      <View style={styles.container}>
        <Button
          style={styles.button}
          title="Bluetooth"
          onPress={() => setModule('bluetooth')}
        />
        <Button
          style={styles.button}
          title="Graph"
          onPress={() => setModule('glucose')}
        />
        {module === 'bluetooth' && <BluetoothTest />}
      </View>
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {},
});
