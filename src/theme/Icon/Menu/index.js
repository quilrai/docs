import React from 'react';
import {Menu} from 'lucide-react';

export default function IconMenu({
  width = 22,
  height = 22,
  className,
  ...restProps
}) {
  return (
    <Menu
      className={className}
      width={width}
      height={height}
      aria-hidden="true"
      {...restProps}
    />
  );
}
