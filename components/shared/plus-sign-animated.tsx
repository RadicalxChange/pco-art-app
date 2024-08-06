import { useState } from "react";
import { animated, useSpring } from "react-spring";
import { interpolate } from "flubber";

const path1 = [
  "M0.317627 8.66278H17.3582",
  "M0.317627 8.66278L17.3582 8.66278",
];
const path2 = [
  "M8.83786 9.12593C8.83786 8.89126 9.05404 8.66278 9.2981 8.66278L8.83786 8.66278L8.83786 9.12593Z",
  "M8.83748 17.1788C8.83748 12.8638 12.8124 8.66278 17.2999 8.66278L8.83748 8.66278L8.83748 17.1788Z",
];
const path3 = [
  "M8.83792 8.19969C8.83792 8.43436 8.62174 8.66284 8.37769 8.66284L8.83792 8.66284L8.83792 8.19969Z",
  "M8.83818 0.148411C8.83818 4.46336 4.86322 8.66443 0.375732 8.66443L8.83818 8.66443L8.83818 0.148411Z",
];
const path4 = [
  "M9.30104 8.66276C9.06637 8.66276 8.83789 8.44376 8.83789 8.19971V8.66276H9.30104Z",
  "M17.3542 8.66276C13.0392 8.66276 8.83813 4.63593 8.83813 0.148438L8.83813 8.66276L17.3542 8.66276Z",
];
const path5 = [
  "M8.37474 8.66286C8.60941 8.66286 8.83789 8.88186 8.83789 9.12592L8.83789 8.66286L8.37474 8.66286Z",
  "M0.321506 8.66445C4.63646 8.66445 8.83752 12.6913 8.83752 17.1788L8.83753 8.66445L0.321506 8.66445Z",
];

export default function PlusSignAnimated(props: {
  children: React.ReactElement;
}) {
  const { children } = props;

  const [isHovering, setIsHovering] = useState(false);
  const [interpolators, setInterpolators] = useState({
    path1: interpolate(path1[0], path1[0], { maxSegmentLength: 0.5 }),
    path2: interpolate(path2[0], path2[0], { maxSegmentLength: 0.5 }),
    path3: interpolate(path3[0], path3[0], { maxSegmentLength: 0.5 }),
    path4: interpolate(path4[0], path4[0], { maxSegmentLength: 0.5 }),
    path5: interpolate(path5[0], path5[0], { maxSegmentLength: 0.5 }),
  });

  const animationProps = useSpring({
    from: { x: 0 },
    to: {
      x: 1,
    },
    config: {
      clamp: true,
    },
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
        path4: interpolate(path4[prevIndex], path4[newIndex], {
          maxSegmentLength: 0.5,
        }),
        path5: interpolate(path5[prevIndex], path5[newIndex], {
          maxSegmentLength: 0.5,
        }),
      });

      return !prev;
    });
  };

  return (
    <div
      className="flex items-center gap-1"
      onMouseEnter={handleHover}
      onMouseLeave={handleHover}
    >
      <div
        className="flex flex-center"
        style={{
          width: 15,
          height: 15,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <animated.path
            d={animationProps.x.to(interpolators.path1)}
            stroke="black"
          />
          <animated.path d="M8.83813 0.142517L8.83813 17.183" stroke="black" />
          <animated.path
            d={animationProps.x.to(interpolators.path2)}
            fill="black"
          />
          <animated.path
            d={animationProps.x.to(interpolators.path3)}
            fill="black"
          />
          <animated.path
            d={animationProps.x.to(interpolators.path4)}
            fill="black"
          />
          <animated.path
            d={animationProps.x.to(interpolators.path5)}
            fill="black"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}
