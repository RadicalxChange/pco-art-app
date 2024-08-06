import { useState } from "react";
import { animated, useSpring } from "react-spring";
import { interpolate } from "flubber";

const path1 = ["M0.101562 9.38153H18.0534", "M0.782227 9.57776H18.9618"];
const path2 = [
  "M9.07715 0.374084L18.053 9.38149L9.07715 18.3889",
  "M9.87207 0.488098L18.9617 9.57777L9.87207 18.6674",
];
const path3 = [
  [[0, 0]],
  "M11.7886 9.58789C15.3161 9.58789 15.9508 6.58411 12.9336 3.58032L18.968 9.58789C18.0895 10.4664 17.864 10.7959 12.9336 15.7263C16.0321 12.6088 15.3163 9.58789 11.7886 9.58789Z",
];

export default function ForwardArrowAnimated(props: {
  children: React.ReactElement;
}) {
  const { children } = props;

  const [isHovering, setIsHovering] = useState(false);
  const [interpolators, setInterpolators] = useState({
    path1: interpolate(path1[0], path1[0], { maxSegmentLength: 0.5 }),
    path2: interpolate(path2[0], path2[0], { maxSegmentLength: 0.5 }),
    path3: interpolate(path3[0], path3[0], { maxSegmentLength: 0.5 }),
  });

  const animationProps = useSpring({
    from: { x: 0 },
    to: {
      x: 1,
    },
    config: {
      clamp: true,
    },
    immediate: true,
    reset: true,
  });

  const handleHover = () => {
    setIsHovering((prev) => {
      const prevIndex = prev ? 1 : 0;
      const newIndex = prev ? 0 : 1;

      setInterpolators({
        path1: interpolate(path1[prevIndex], path1[newIndex], {
          maxSegmentLength: 0.5,
        }),
        path2: interpolate(path2[prevIndex], path2[newIndex], {
          maxSegmentLength: 0.5,
        }),
        path3: interpolate(path3[prevIndex], path3[newIndex], {
          maxSegmentLength: 0.5,
        }),
      });

      return !prev;
    });
  };

  return (
    <div
      className="flex items-center gap-2 w-full py-1"
      onMouseEnter={handleHover}
      onMouseLeave={handleHover}
    >
      <div
        className="flex items-center"
        style={{
          width: 18,
          height: 18,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <animated.path
            d={animationProps.x.to(interpolators.path1)}
            stroke="black"
          />
          <animated.path
            d={animationProps.x.to(interpolators.path2)}
            stroke="black"
          />
          <animated.path
            d={animationProps.x.to(interpolators.path3)}
            fill="black"
            stroke="black"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}
