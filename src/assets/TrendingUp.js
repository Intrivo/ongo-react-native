import * as React from 'react';
import Svg, { G, Path, Defs, ClipPath } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={22}
      height={20}
      viewBox='0 0 22 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <G clipPath='url(#clip0_27638_58413)'>
        <Path
          d='M14.706 5l1.996 1.908-4.253 4.067-3.486-3.333-6.459 6.183L3.734 15l5.229-5 3.486 3.333 5.49-5.241L19.937 10V5h-5.23z'
          fill='#49C37C'
        />
      </G>
      <Defs>
        <ClipPath id='clip0_27638_58413'>
          <Path fill='#fff' transform='translate(.761)' d='M0 0H20.9174V20H0z' />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

export default SvgComponent;
