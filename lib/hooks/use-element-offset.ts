import { useState, useLayoutEffect } from "react";

export default function useElementOffset(
  ref: React.MutableRefObject<HTMLDivElement | null>
) {
  const [offset, setOffset] = useState<{ left: number; top: number }>();

  useLayoutEffect(() => {
    const updateOffset = () =>
      ref?.current
        ? setOffset({
            left: ref?.current?.offsetLeft,
            top: ref.current.offsetTop,
          })
        : null;

    updateOffset();
    window.addEventListener("resize", () => updateOffset());

    return () => window.removeEventListener("resize", updateOffset);
  }, [ref]);

  return offset;
}
