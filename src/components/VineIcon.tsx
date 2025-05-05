import React from "react";

interface VineIconProps {
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

const VineIcon: React.FC<VineIconProps> = ({
  color = "#5e2a69",
  width = 24,
  height = 24,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2C7.58 2 4 5.58 4 10C4 14.42 7.58 18 12 18C16.42 18 20 14.42 20 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 2C18.4 2 17 3.4 17 5C17 6.6 18.4 8 20 8C21.6 8 23 6.6 23 5C23 3.4 21.6 2 20 2Z"
        fill={color}
      />
      <path
        d="M20 8V10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14.5C9 13.8 8.5 12.5 8.5 11C8.5 9.5 9 8 10 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7C15 7.7 15.5 9 15.5 10.5C15.5 12 15 13.5 14 14.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 18V22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22H15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default VineIcon;
