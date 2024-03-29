import React, { useState } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

import { ApiProvider, GlucoseGraph, WeightGraph } from '../../src';
import BluetoothTest from './BluetoothTest';

export default function App() {
  const [module, setModule] = useState<string>();

  return (
    <ApiProvider
      apiKey="ALPYPyCsgiAnJh9pG8MnU6Jw"
      baseUrl="https://dev.intrivo.com"
      accessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2Rldi5pbnRyaXZvLmNvbSIsImNvbnNlbnQiOltdLCJleHAiOjE3MTE0OTU0MjEsImlzcyI6Imh0dHBzOi8vZGV2LmludHJpdm8uY29tL2FwaS92Mi9qd3QvdG9rZW4iLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3Iiwic3ViIjoiMDAwMDY3ZGUtZjBhNS00ZGM0LWJhZmQtYjRmMDAzOTJiZGRhIn0.Yf9DfW2huBHznpMYdTBgNhX-bGNpKG3SizKhzmdb4QI"
    >
      <View style={styles.container}>
        <View style={styles.buttons}>
          {!module ? (
            <>
              <Button
                style={styles.button}
                title="Bluetooth"
                onPress={() => setModule('bluetooth')}
              />
              <Button
                style={styles.button}
                title="Glucose"
                onPress={() => setModule('glucose')}
              />
              <Button
                style={styles.button}
                title="Weight"
                onPress={() => setModule('weight')}
              />
            </>
          ) : (
            <Button
              style={styles.button}
              title="Back"
              onPress={() => setModule(undefined)}
            />
          )}
        </View>
        {module === 'bluetooth' && <BluetoothTest />}
        {module === 'glucose' && <GlucoseGraph />}
        {module === 'weight' && <WeightGraph />}
      </View>
    </ApiProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttons: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 8,
  },
});
