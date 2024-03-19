import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <G clipPath='url(#clip0_27638_58468)'>
        <Path d='M18.333 10L15 6.667v2.5H2.5v1.666H15v2.5L18.333 10z' fill='#49C37C' />
      </G>
      <Defs>
        <ClipPath id='clip0_27638_58468'>
          <Path fill='#fff' d='M0 0H20V20H0z' />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
