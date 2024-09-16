"use client";

import Link from "next/link";
import PlusSignIcon from "@/components/shared/plus-sign-icon";

export default function About() {
  return (
    <>
      <div className="flex justify-between w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 min-[2000px]:mt-32 px-4">
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
        <h1 className="font-mono text-5xl sm:text-[75px] xl:text-[130px] 2xl:text-[145px] text-center">
          About
        </h1>
        <div className="flex flex-col justify-between">
          <PlusSignIcon />
          <PlusSignIcon />
        </div>
      </div>
      <div className="flex justify-between items-start w-full mt-12 sm:mt-16 xl:mt-20 2xl:mt-24 px-4 text-sm sm:text-lg">
        <PlusSignIcon />
        <div className="flex w-[350px] sm:w-[600px] xl:w-[800px] 2xl:w-[1100px]">
          <div className="flex items-start gap-2 w-[45%]">
            <PlusSignIcon />
            About
          </div>
          <div className="flex items-start gap-2 w-[55%]">
            Art enriches society through the weaving of relations between the
            cultures that create it and the cultures that receive it. Partial
            common ownership of art is a new evolving system that allows
            artists, communities and holders of art to create structures of
            shared ownership and distribution of value that reflects those
            living relationships.
            <PlusSignIcon />
          </div>
        </div>
        <PlusSignIcon />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-[350px] sm:w-[600px] xl:w-[800px] 2xl:w-[1100px] text-sm sm:text-lg">
          <div className="flex mt-12">
            <div className="flex items-start gap-2 w-[45%]">
              <PlusSignIcon />
              Collaborators
            </div>
            <div className="flex items-start gap-2 w-[55%]">
              <div>
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
              <PlusSignIcon />
            </div>
          </div>
          <div className="flex mt-12">
            <div className="flex items-start gap-2 w-[45%]">
              <PlusSignIcon />
              Team
            </div>
            <div className="flex items-start gap-2 w-[55%]">
              <div className="flex flex-col">
                <span>Project Leads</span>
                <span className="font-serif text-xl">
                  Victoria Ivanova [R&D Strategic Lead, Serpentine Arts
                  Technologies]
                  <br />
                  Matt Prewitt [President, RadicalxChange]
                </span>
                <span className="mt-5">Production</span>
                <span className="font-serif text-xl">
                  Tommie Introna [R&D Producer, Serpentine Arts Technologies]
                  <br />
                  Matt Prewitt [RadicalxChange]
                  <br />
                  Graven Prest [Flow State Coop]
                </span>
                <span className="mt-5">
                  Partial Common Ownership System R&D
                </span>
                <span className="font-serif text-xl">
                  Paula Berman, Stefano De Berardinis, Cody Hatfield, Jack
                  Henderson, Will Holley, Tommie Introna, Victoria Ivanova,
                  Graven Prest, Matt Prewitt, Alice Scope, Lucy Sollitt, Rival
                  Strategy, Ruth Waters, Kay Watson 
                </span>
                <span className="mt-5">Blockchain Development</span>
                <span className="font-serif text-xl">Cody Hatfield</span>
                <span className="mt-5">Web Development</span>
                <span className="font-serif text-xl">
                  Stefano De Berardinis
                </span>
                <span className="mt-5">Graphic Design</span>
                <span className="font-serif text-xl">Jaime Del Corro</span>
              </div>
              <PlusSignIcon />
            </div>
          </div>
          <div className="flex mt-12">
            <div className="flex items-start gap-2 w-[45%] mt-1">
              <PlusSignIcon />
              Contact Us
            </div>
            <div className="flex justify-between gap-2 w-[55%]">
              <div className="flex flex-col text-xl font-serif break-all">
                fae@serpentinegalleries.org
              </div>
              <PlusSignIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-start w-full mt-12 mb-24 xl:mb-32 px-4 text-sm sm:text-lg">
        <PlusSignIcon />
        <div className="flex w-[350px] sm:w-[600px] xl:w-[800px] 2xl:w-[1100px]">
          <div className="flex items-start gap-2 w-[45%]">
            <PlusSignIcon />
            Newsletter
          </div>
          <div id="mc_embed_shell" className="flex items-start gap-2 w-[55%]">
            <div id="mc_embed_signup">
              <form
                action="https://serpentinegalleries.us7.list-manage.com/subscribe/post?u=1bdbaf8e7f6d414f3521c9eec&amp;id=f623c856e9&amp;v_id=174&amp;f_id=0071c3e1f0"
                method="post"
                id="mc-embedded-subscribe-form"
                name="mc-embedded-subscribe-form"
                target="_blank"
                noValidate
              >
                <div
                  id="mc_embed_signup_scroll"
                  className="flex flex-col w-full"
                >
                  <div className="flex flex-col">
                    <label htmlFor="mce-EMAIL">Email Address *</label>
                    <input
                      type="email"
                      name="EMAIL"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      id="mce-EMAIL"
                      required
                    />
                  </div>
                  <div className="flex flex-col mt-5">
                    <label htmlFor="mce-FNAME">First Name </label>
                    <input
                      type="text"
                      name="FNAME"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      id="mce-FNAME"
                    />
                  </div>
                  <div className="flex flex-col mt-5">
                    <label htmlFor="mce-LNAME">Last Name </label>
                    <input
                      type="text"
                      name="LNAME"
                      className="w-full bg-transparent border-solid border-0 border-b border-black p-0 focus:outline-none focus:ring-0 focus:border-black font-serif text-xl placeholder-[#ADADAD]"
                      id="mce-LNAME"
                    />
                  </div>
                  <div id="mergeRow-gdpr" className="mt-5">
                    <div>
                      <label>Marketing Permissions</label>
                      <fieldset
                        className="flex items-center gap-2 mt-2"
                        name="interestgroup_field"
                      >
                        <input
                          type="checkbox"
                          className="rounded-full text-black border-black focus:ring-0 focus:ring-offset-0 focus:outline-none"
                          id="gdpr_694"
                          name="gdpr[694]"
                          value="Y"
                        />
                        <label className="font-serif text-xl" htmlFor="gdpr694">
                          Email
                        </label>
                      </fieldset>
                      <p className="mt-5 text-sm">
                        You can unsubscribe at any time by clicking the link in
                        the footer of our emails. For information about our
                        privacy practices, please visit our website on
                        https://www.serpentinegalleries.org/privacy-policy
                      </p>
                    </div>
                    <div className="text-sm mt-2">
                      <p>
                        We use Mailchimp as our marketing platform. By clicking
                        below to subscribe, you acknowledge that your
                        information will be transferred to Mailchimp for
                        processing.{" "}
                        <a
                          href="https://mailchimp.com/legal/terms"
                          target="_blank"
                          className="underline"
                        >
                          Learn more
                        </a>{" "}
                        about Mailchimp's privacy practices.
                      </p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    name="subscribe"
                    id="mc-embedded-subscribe"
                    className="bg-neon-green mt-5 py-1 font-serif text-xl"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
            <PlusSignIcon />
          </div>
        </div>
        <PlusSignIcon />
      </div>
    </>
  );
}
