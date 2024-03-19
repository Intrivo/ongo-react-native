import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { OnGoApi } from '../../src';

export default function BluetoothTest() {
  const [result, setResult] = React.useState<number | undefined>();

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
