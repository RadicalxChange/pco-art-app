import Image from "next/image";
import { useMediaQuery } from "react-responsive";

export default function CrossIcon() {
  const isBigScreen = useMediaQuery({ query: "(min-width: 2000px)" });

  return (
    <Image
      src="/cross.svg"
      alt="Cross"
      width={isBigScreen ? 17 : 12}
      height={isBigScreen ? 17 : 12}
    />
  );
}
