import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { BluetoothConnectors } from '../../src';

export default function BluetoothTest() {
  const [result, setResult] = React.useState<number | undefined>();

  React.useEffect(() => {
    setResult(0);
  }, []);

  BluetoothConnectors.useWeightScale({ unit: 'kg' }, (weight: number) => {
    setResult(weight);
  });

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
