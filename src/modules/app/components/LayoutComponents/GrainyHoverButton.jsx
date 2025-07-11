import { GrainyElement } from "../../../design-system/GrainyElement";
import PropTypes from "prop-types";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { useCallback, useRef } from "react";

export const GrainyElementButton = ({
  className,
  active = false,
  disabled = false,
  children,
  onClick,
  restingPosX = 50,
  restingPosY = -200,
  gradientSize = 10,
  gradientSizeY = 10,
}) => {
  const grainyDivRef = useRef(null);

  const mouseX = useMotionValue(restingPosX);
  const mouseY = useMotionValue(restingPosY);

  const mouseXSpring = useSpring(mouseX, { stiffness: 400, damping: 50 });
  const mouseYSpring = useSpring(mouseY, { stiffness: 400, damping: 50 });

  const handleMouseMove = ({ clientX, clientY, currentTarget }) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();

    // mouseX.set(((clientX - left) / width) * 100);
    // mouseY.set(((clientY - top) / height) * 100);

    mouseX.set(50);
    mouseY.set(50);
  };

  const handleMouseLeave = useCallback(() => {
    mouseX.set(restingPosX);
    mouseY.set(restingPosY);
  }, [restingPosX, restingPosY]);

  if (disabled) {
    mouseX.set(restingPosX);
    mouseY.set(restingPosY);
  }

  const spotlightBackground = useMotionTemplate`radial-gradient(${gradientSize}rem ${gradientSizeY}rem at ${mouseXSpring}% ${mouseYSpring}%, hsl(var(--appLayoutInverseHover)) 0%, hsl(var(--appBackgroundAccent)))`;

  return (
    <motion.button
      onClick={onClick}
      ref={grainyDivRef}
      onMouseMove={({ clientX, clientY, currentTarget }) => {
        if (disabled) return;
        handleMouseMove({ clientX, clientY, currentTarget });
      }}
      onMouseLeave={handleMouseLeave}
      className={`transition-all ease-out relative duration-200 ${!disabled && "hover:-translate-y-1 shadow-md hover:shadow-lg"} shadow-appLayoutGentleShadow ${
        active && "bg-appLayoutInverseHover"
      } ${className}`}
      style={{
        backgroundBlendMode: "color",
        backgroundSize: "100%",
        backgroundImage: !disabled ? spotlightBackground : "none",
      }}
    >
      <div className={`absolute w-full h-full bg-repeat top-0 left-0 ${!disabled && "noiseFine"} mix-blend-multiply`}></div>
      {children}
    </motion.button>
  );
};
