import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';

export interface Position {
  x: number;
  y: number;
}

export interface DotProps extends Position {
  visible: boolean;
  chartHeight: number;
  index: number;
}

export interface BarProps extends Position {
  height: number;
}

const ChartBar = ({ height, x, y }: BarProps) => (
  <LinearGradient
    style={{ height, width: 23, left: x - 10, top: y }}
    colors={[colors.transparentBlue, colors.transparentBlue2]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
  />
);

const ChartDot = ({ x, y, chartHeight, index }: DotProps) => {
  const yWithBottomPadding = y + 20;
  const barHeight = chartHeight - yWithBottomPadding;

  return index === 0 ? (
    <>
      <View style={[styles.outerDotContainer, { top: y - 10, left: x - 10 }]}>
        <View style={styles.innerDotContainer} />
      </View>
      <ChartBar height={barHeight} x={x} y={y} />
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
