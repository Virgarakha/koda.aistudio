import React from "react";

export function AbstractWireframe({
  variant = "qbr",
  className = "w-full h-full",
}: {
  variant?: "qbr" | "survey" | "feedback" | "contract";
  className?: string;
}) {
  if (variant === "survey") {
    return (
      <svg
        className={className}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M30 45 C30 15, 60 15, 60 55 C60 95, 30 115, 55 125 C80 135, 110 100, 100 70 C90 40, 120 30, 135 60 C150 90, 120 130, 90 135 C60 140, 35 110, 45 80 C55 50, 85 45, 115 55"
          stroke="#52504C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 70 C50 30, 90 20, 105 50 C120 80, 70 120, 50 95 C30 70, 70 40, 95 65"
          stroke="#44423E"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "feedback") {
    return (
      <svg
        className={className}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M20 70 C20 30, 70 20, 80 60 C90 100, 40 120, 70 130 C100 140, 130 90, 120 50 C110 10, 150 30, 150 80"
          stroke="#5A5752"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M30 110 C50 130, 90 110, 80 80 C70 50, 110 40, 130 70 C150 100, 110 130, 90 110"
          stroke="#42403C"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === "contract") {
    return (
      <svg
        className={className}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M25 50 Q 50 20, 75 50 T 125 50 T 145 90 T 100 130 T 45 110 Z"
          stroke="#4F4D48"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M35 85 C45 50, 80 40, 100 65 C120 90, 90 125, 60 115 C30 105, 55 65, 85 75"
          stroke="#3E3C38"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Default: QBR deck style loops
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 80 C25 35, 65 30, 75 65 C85 100, 45 125, 75 130 C105 135, 135 95, 120 55 C105 15, 145 25, 145 75 C145 125, 95 135, 70 110 C45 85, 70 45, 95 60 C120 75, 105 110, 85 115"
        stroke="#595651"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 55 C45 25, 80 30, 90 60 C100 90, 60 115, 80 120 C100 125, 125 90, 115 65"
        stroke="#45433F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
