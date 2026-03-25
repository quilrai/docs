import React from 'react';

export default function IconClose({
  width = 22,
  height = 22,
  color = 'currentColor',
  className,
  ...restProps
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...restProps}>
      <path
        d="M18 6 6 18M6 6l12 12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
