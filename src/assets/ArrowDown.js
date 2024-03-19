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
        d='M2.12.29L6 4.17 9.88.29a.996.996 0 111.41 1.41L6.7 6.29a.996.996 0 01-1.41 0L.7 1.7A.996.996 0 01.7.29c.39-.38 1.03-.39 1.42 0z'
        fill='#333'
      />
    </Svg>
  );
}

export default SvgComponent;
