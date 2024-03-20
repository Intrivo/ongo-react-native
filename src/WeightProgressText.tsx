import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ArrowDown from './assets/arrow_down_inline.svg';
import ArrowUp from './assets/arrow_up_inline.svg';
import { FontFamily, FontSize } from './fonts';
import colors from './colors';

const WeightProgressText: React.FC<{ progress: number }> = ({ progress }) => {
  const statusColor = progress >= 0 ? colors.lightGreen : colors.statusRed;

  return progress !== 0 ? (
    <View style={styles.container}>
      {progress > 0 && <ArrowDown height={18} />}
      {progress < 0 && <ArrowUp height={18} />}
      <Text>
        <Text style={[styles.text, { fontSize: FontSize.sizeLarge, color: statusColor }]}>{`${Math.abs(
          progress
        )}`}</Text>
        <Text style={[styles.text, { alignSelf: 'flex-end', fontSize: FontSize.sizeSmall }]}> lb</Text>
      </Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  text: {
    fontFamily: FontFamily.familyNormal,
  },
  arrowDown: {
    transform: [{ rotate: '180deg' }],
  },
});

export default WeightProgressText;
