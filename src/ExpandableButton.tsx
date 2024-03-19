import React from 'react';
import { Pressable } from 'react-native';
import ArrowUp from './assets/ArrowUp';
import ArrowDown from './assets/ArrowDown.js';

const ExpandableButton = ({
  isExpanded,
  onClick,
}: {
  isExpanded: boolean;
  onClick: () => void;
}) => (
  <Pressable
    style={{
      height: 16,
      justifyContent: 'center',
      alignSelf: 'center',
    }}
    hitSlop={24}
    onPress={onClick}
  >
    {isExpanded ? (
      <ArrowUp width={12} height={12} fill='#333333' />
    ) : (
      <ArrowDown width={12} height={12} fill='#333333' />
    )}
  </Pressable>
);

export default ExpandableButton;
