"use client";

import Image from "next/image";
import { useState } from "react";
import About from "../../components/layout/about";
import SignUp from "../../components/layout/signup";

export default function Home() {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const handleOpenAbout = () => {
    setIsSignUpOpen(false);
    setIsAboutOpen(true);
  };

  const handleOpenSignUp = () => {
    setIsAboutOpen(false);
    setIsSignUpOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-screen items-center justify-between gap-6 md:gap-16 p-5 md:p-10 pb-0 md:pb-0 max-w-screen-2xl mx-auto">
        <h1 className="block md:hidden text-black-pco text-8xl self-start leading-[80px] font-mono">
          PCO
        </h1>

        <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
          <Image
            draggable={false}
            priority={true}
            src="/Logo.svg"
            alt="Logo"
            width={500}
            height={500}
            className="max-w-full max-h-full w-auto h-auto object-contain"
          />
          <About isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
          <SignUp
            isOpen={isSignUpOpen}
            onClose={() => setIsSignUpOpen(false)}
          />
        </div>

        <div className="flex justify-between w-full shrink-0">
          <h1 className="hidden md:block text-black-pco text-8xl leading-[80px] font-mono">
            PCO
          </h1>

          <div className="flex justify-between md:items-end md:justify-center w-full md:w-auto px-4 md:px-0 gap-6 text-black-pco text-2xl font-light underline leading-6">
            <button
              onClick={handleOpenAbout}
              className="cursor-pointer hover:bg-green-pco md:px-5 md:py-3 h-fit transition-all duration-300 font-serif"
            >
              About
            </button>
            <button
              onClick={handleOpenSignUp}
              className="cursor-pointer hover:bg-green-pco md:px-5 md:py-3 h-fit transition-all duration-300 flex items-center gap-2 font-serif"
            >
              <span>Sign Up</span>
              <img src="/Arrow.svg" alt="arrow-right" />
            </button>
          </div>
        </div>

        <div className="w-full bg-green-pco md:px-9 md:py-4 px-5 py-2 flex justify-start items-center shrink-0">
          <span className="text-black leading-6 sans">© 2025 PCO</span>
        </div>
      </div>
    </>
  );
}
