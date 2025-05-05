import React, { useEffect, useRef } from "react";
import "../styles/VineAnimation.scss";

interface VineAnimationProps {
  className?: string;
}

const VineAnimation: React.FC<VineAnimationProps> = ({ className }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Initialize the vine animation
    const svg = svgRef.current;
    if (!svg) return;

    // Reset animation effect
    const resetAnimation = () => {
      const paths = Array.from(svg.querySelectorAll("path"));
      paths.forEach((path) => {
        const length = path.getTotalLength();

        // Initialize paths
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        // Trigger reflow
        path.getBoundingClientRect();

        // Start animation
        path.style.transition = "stroke-dashoffset 2s ease-in-out";
        path.style.strokeDashoffset = "0";
      });
    };

    // Initial animation run
    resetAnimation();

    // Set up periodic animation
    const intervalId = setInterval(() => {
      const paths = Array.from(svg.querySelectorAll("path"));
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.transition = "none";
        path.style.strokeDashoffset = `${length}`;

        // Trigger reflow
        path.getBoundingClientRect();

        // Restart animation
        path.style.transition = "stroke-dashoffset 3s ease-in-out";
        path.style.strokeDashoffset = "0";
      });
    }, 10000); // Repeat every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={`vine-animation-container ${className || ""}`}>
      <svg
        ref={svgRef}
        className="vine-svg"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        {/* Main vine lines */}
        <path
          className="vine-path vine-primary"
          d="M0,500 C150,400 250,600 350,450 C450,300 500,500 600,400 C700,300 750,500 850,400 C950,300 980,500 1000,400"
        />

        {/* Branch vines */}
        <path
          className="vine-path vine-secondary"
          d="M200,500 C250,400 300,350 350,300"
        />

        <path
          className="vine-path vine-secondary"
          d="M400,450 C450,400 500,450 520,350"
        />

        <path
          className="vine-path vine-tertiary"
          d="M330,380 C360,340 380,360 400,320"
        />

        <path
          className="vine-path vine-secondary"
          d="M600,400 C650,350 680,380 700,300"
        />

        <path
          className="vine-path vine-tertiary"
          d="M420,430 C450,410 470,430 490,400"
        />

        <path
          className="vine-path vine-secondary"
          d="M800,400 C850,350 870,380 900,300"
        />

        {/* Leaves and tendrils */}
        <path
          className="vine-path vine-leaf"
          d="M300,420 C310,400 330,410 330,430 C330,450 310,460 300,420 Z"
        />

        <path
          className="vine-path vine-leaf"
          d="M550,380 C560,360 580,370 580,390 C580,410 560,420 550,380 Z"
        />

        <path
          className="vine-path vine-leaf"
          d="M750,370 C760,350 780,360 780,380 C780,400 760,410 750,370 Z"
        />

        {/* Tendrils */}
        <path
          className="vine-path vine-tendril"
          d="M480,400 C500,380 500,350 480,330 C460,310 450,310 460,330"
        />

        <path
          className="vine-path vine-tendril"
          d="M680,370 C700,350 700,320 680,300 C660,280 650,280 660,300"
        />

        <path
          className="vine-path vine-tendril"
          d="M880,350 C900,330 900,300 880,280 C860,260 850,260 860,280"
        />
      </svg>
    </div>
  );
};

export default VineAnimation;
