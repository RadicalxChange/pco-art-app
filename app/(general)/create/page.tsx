"use client";
import { useState } from "react";

import Intro from "@/components/create/000-intro";
import ConfigStewardLicenseFacet from "@/components/create/001-steward-license";
import ConfigPCOSettingsFacet from "@/components/create/002-pco-settings";
import ConfigBeneficiaryFacet from "@/components/create/003-beneficiary";
import ConfigAuctionFacet from "@/components/create/004-auction";
import ConfigAllowlistFacet from "@/components/create/005-allowlist";
import ConfigPermissions from "@/components/create/006-permissions";
import CreateReview from "@/components/create/007-review";

export default function CreatePage() {
  const [step, setStep] = useState(0);

  function nextStep() {
    setStep(step + 1);
  }

  function prevStep() {
    setStep(step - 1);
  }

  return (
    <>
      {step === 0 ? (
        <Intro nextStep={nextStep} />
      ) : step === 1 ? (
        <ConfigStewardLicenseFacet nextStep={nextStep} prevStep={prevStep} />
      ) : step === 2 ? (
        <ConfigPCOSettingsFacet nextStep={nextStep} prevStep={prevStep} />
      ) : step === 3 ? (
        <ConfigBeneficiaryFacet nextStep={nextStep} prevStep={prevStep} />
      ) : step === 4 ? (
        <ConfigAuctionFacet nextStep={nextStep} prevStep={prevStep} />
      ) : step === 5 ? (
        <ConfigAllowlistFacet nextStep={nextStep} prevStep={prevStep} />
      ) : step === 6 ? (
        <ConfigPermissions nextStep={nextStep} prevStep={prevStep} />
      ) : step === 7 ? (
        <CreateReview prevStep={prevStep} setStep={setStep} />
      ) : (
        <></>
      )}
    </>
  );
}
