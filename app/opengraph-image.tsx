import { ImageResponse } from "next/server";

import { siteConfig } from "@/config/site";

export const runtime = "edge";

export const alt = "TurboETH Logo";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const getFont = async () => {
  const res = await fetch(
    new URL("../assets/fonts/SuisseIntl-Medium.otf", import.meta.url)
  );
  return await res.arrayBuffer();
};

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage:
            "linear-gradient(to bottom right, #FFF 25%, #FFF0CA 75%)",
        }}
      >
        <img
          src={new URL("../public/serpentine.png", import.meta.url).toString()}
          alt="Logo"
          tw="w-20 h-20 mb-4 opacity-95"
        />
        <h1
          style={{
            fontSize: "100px",
            fontFamily: "SuisseIntl",
            fontWeight: 900,
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.name}
        </h1>
        <h3
          style={{
            fontSize: "22px",
            fontFamily: "SuisseIntl",
            background:
              "linear-gradient(to bottom right, #000000 21.66%, #78716c 86.47%)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: "5rem",
            letterSpacing: "-0.02em",
          }}
        >
          {siteConfig.description}
        </h3>
      </div>
    ),
    {
      fonts: [
        {
          name: "SuisseIntl",
          data: await getFont(),
        },
      ],
    }
  );
}
