import Link from "next/link";

export default function About() {
  return (
    <>
      <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[100px] 2xl:text-[160px] text-center leading-none mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32">
        About
      </h1>
      <div className="flex flex-col items-center max-w-[320px] sm:max-w-[750px] xl:max-w-[1100px] 2xl:max-w-[1500px] m-auto">
        <div className="w-[350px] sm:w-[600px] xl:w-[800px] 2xl:w-[1100px] my-10 sm:mt-16 xl:mt-20 2xl:mt-24 text-lg sm:text-xl mb-24 xl:mb-32">
          <div className="flex">
            <span className="w-1/3">About</span>
            <span className="w-2/3">
              Art enriches society through the weaving of relations between the
              cultures that create it and the cultures that receive it. Partial
              common ownership of art is a new evolving system that allows
              artists, communities and holders of art to create structures of
              shared ownership and distribution of value that reflects those
              living relationships.
            </span>
          </div>
          <div className="flex mt-10">
            <span className="w-1/3">Collaborators</span>
            <div className="w-2/3">
              The PCO project is initiated and incubated by{" "}
              <Link
                href="https://www.radicalxchange.org/#message"
                target="_blank"
                className="underline"
              >
                RadicalxChange
              </Link>{" "}
              and the{" "}
              <Link
                href="https://futureartecosystems.org"
                target="_blank"
                className="underline"
              >
                Future Art Ecosystems
              </Link>{" "}
              the team at{" "}
              <Link
                href="https://www.serpentinegalleries.org/arts-technologies/"
                target="_blank"
                className="underline"
              >
                Serpentine Arts
              </Link>{" "}
              Technologies.
            </div>
          </div>
          <div className="flex mt-10">
            <span className="w-1/3">Team</span>
            <div className="flex flex-col w-2/3">
              <span>Project Leads</span>
              <span className="font-serif text-2xl">
                Victoria Ivanova [R&D Strategic Lead, Serpentine Arts
                Technologies]
                <br />
                Matt Prewitt [President, RadicalxChange]
              </span>
              <span className="mt-5">Production</span>
              <span className="font-serif text-2xl">
                Tommie Introna [R&D Producer, Serpentine Arts Technologies]
                <br />
                Matt Prewitt [RadicalxChange]
                <br />
                Graven Prest [Flow State Coop]
              </span>
              <span className="mt-5">Partial Common Ownership System R&D</span>
              <span className="font-serif text-2xl">
                Paula Berman, Stefano De Berardinis, Cody Hatfield, Jack
                Henderson, Will Holley, Tommie Introna, Victoria Ivanova, Graven
                Prest, Matt Prewitt, Alice Scope, Lucy Sollitt, Rival Strategy,
                Ruth Waters, Kay Watson 
              </span>
              <span className="mt-5">Blockchain Development</span>
              <span className="font-serif text-2xl">Cody Hatfield</span>
              <span className="mt-5">Web Development</span>
              <span className="font-serif text-2xl">Stefano De Berardinis</span>
              <span className="mt-5">Graphic Design</span>
              <span className="font-serif text-2xl">Jaime Del Corro</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
