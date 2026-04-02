import React from 'react';
import {X} from 'lucide-react';

export default function IconClose({
  width = 22,
  height = 22,
  color = 'currentColor',
  className,
  ...restProps
}) {
  return (
    <X
      className={className}
      width={width}
      height={height}
      color={color}
      aria-hidden="true"
      {...restProps}
    />
  );
}
