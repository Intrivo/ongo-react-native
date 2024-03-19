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
      <G clipPath='url(#clip0_27638_58454)'>
        <Path
          d='M13.333 15l1.909-1.908-4.067-4.067-3.334 3.333-6.175-6.183L2.841 5l5 5 3.334-3.333 5.25 5.241L18.333 10v5h-5z'
          fill='#49C37C'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_27638_58454'>
          <Path fill='#fff' d='M0 0H20V20H0z' />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
