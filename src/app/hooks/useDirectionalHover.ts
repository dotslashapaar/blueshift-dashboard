import { useState, useCallback, RefObject, useRef } from "react";

type Direction =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "right"
  | "bottom"
  | "left";

interface DirectionalTransform {
  x: number;
  y: number;
  direction: Direction;
  swooshAngle: number;
}

const getSwooshAngle = (direction: Direction): number => {
  const angles = {
    top: 180,
    "top-right": 225,
    right: 270,
    "bottom-right": 315,
    bottom: 0,
    "bottom-left": 45,
    left: 90,
    "top-left": 135,
  };
  return angles[direction];
};

export const useDirectionalHover = (
  elementRef: RefObject<HTMLElement | null>
) => {
  const [transform, setTransform] = useState<DirectionalTransform>({
    x: 0,
    y: 0,
    direction: "top",
    swooshAngle: 180,
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isSwooshAnimating, setIsSwooshAnimating] = useState(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent) => {
      if (!elementRef.current) return;

      // Clear any existing animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      const rect = elementRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate relative position (-1 to 1)
      const relativeX = (x - centerX) / centerX;
      const relativeY = (y - centerY) / centerY;

      // Determine direction based on which edge is closest
      const absX = Math.abs(relativeX);
      const absY = Math.abs(relativeY);

      let direction: Direction;
      let transformX = 0;
      let transformY = 0;

      if (absX > absY) {
        // Horizontal movement
        if (relativeX > 0) {
          direction = "right";
          transformX = -4; // Move left when entering from right
        } else {
          direction = "left";
          transformX = 4; // Move right when entering from left
        }
      } else {
        // Vertical movement
        if (relativeY > 0) {
          direction = "bottom";
          transformY = -4; // Move up when entering from bottom
        } else {
          direction = "top";
          transformY = 4; // Move down when entering from top
        }
      }

      // For corner cases, combine movements - increased threshold for more precise corner detection
      if (absX > 0.6 && absY > 0.6) {
        if (relativeX > 0 && relativeY < 0) {
          direction = "top-right";
          transformX = -4;
          transformY = 4;
        } else if (relativeX < 0 && relativeY < 0) {
          direction = "top-left";
          transformX = 4;
          transformY = 4;
        } else if (relativeX > 0 && relativeY > 0) {
          direction = "bottom-right";
          transformX = -4;
          transformY = -4;
        } else {
          direction = "bottom-left";
          transformX = 4;
          transformY = -4;
        }
      }

      const swooshAngle = getSwooshAngle(direction);
      setTransform({ x: transformX, y: transformY, direction, swooshAngle });
      setIsHovered(true);
      setIsSwooshAnimating(true);

      // Set timeout to finish animation (0.7s as per CSS)
      animationTimeoutRef.current = setTimeout(() => {
        setIsSwooshAnimating(false);
      }, 700);
    },
    [elementRef]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ x: 0, y: 0, direction: "top", swooshAngle: 180 });
    setIsHovered(false);
    // Don't immediately stop swoosh animation - let it finish
  }, []);

  return {
    transform,
    isHovered,
    isSwooshAnimating,
    direction: transform.direction,
    swooshAngle: transform.swooshAngle,
    handleMouseEnter,
    handleMouseLeave,
  };
};
