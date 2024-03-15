import React from 'react';
import { Pressable } from 'react-native';
import ArrowUp from './assets/arrow_up.svg';
import ArrowDown from './assets/arrow_down.svg';

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
