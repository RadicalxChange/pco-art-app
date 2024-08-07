import Image from "next/image";
import { useMediaQuery } from "react-responsive";

export default function PlusSignIcon() {
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });

  if (isMobile) {
    return null;
  }

  return <Image src="/plus.svg" alt="Plus Sign" width={16} height={16} />;
}
