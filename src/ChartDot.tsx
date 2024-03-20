import React from 'react';
import { StyleSheet, View } from 'react-native';
import colors from './colors';

export interface Position {
  x?: number;
  y?: number;
}

export interface DotProps extends Position {
  index?: number;
}

export interface BarProps extends Position {
  height: number;
}

const ChartDot = ({ x, y, index }: DotProps) => {
  return index === 0 ? (
    <>
      <View style={[styles.outerDotContainer, { top: y - 10, left: x - 10 }]}>
        <View style={styles.innerDotContainer} />
      </View>
    </>
  ) : (
    <View />
  );
};

export default ChartDot;

const styles = StyleSheet.create({
  outerDotContainer: {
    height: 23,
    width: 23,
    backgroundColor: colors.white,
    position: 'absolute',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  innerDotContainer: {
    height: 7,
    width: 7,
    backgroundColor: colors.slateBlue,
    borderRadius: 10,
  },
});
