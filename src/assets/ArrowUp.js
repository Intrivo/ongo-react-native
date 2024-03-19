import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg
      width={12}
      height={7}
      viewBox='0 0 12 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <Path
        d='M9.88 5.9L6 2.497 2.12 5.9c-.39.342-1.02.342-1.41 0a.8.8 0 010-1.237L5.3.638a1.097 1.097 0 011.41 0l4.59 4.025a.8.8 0 010 1.237c-.39.333-1.03.342-1.42 0z'
        fill='#333'
      />
    </Svg>
  );
}

export default SvgComponent;
