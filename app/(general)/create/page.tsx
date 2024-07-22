'use client'
import { useState } from 'react'

import { motion } from 'framer-motion'

import { WalletConnect } from '@/components/blockchain/wallet-connect'
import ConfigStewardLicenseFacet from '@/components/create/001-steward-license'
import ConfigPCOSettingsFacet from '@/components/create/002-pco-settings'
import ConfigBeneficiaryFacet from '@/components/create/003-beneficiary'
import ConfigAuctionFacet from '@/components/create/004-auction'
import ConfigAllowlistFacet from '@/components/create/005-allowlist'
import ConfigPermissions from '@/components/create/006-permissions'
import CreateReview from '@/components/create/007-review'
import { BranchIsWalletConnected } from '@/components/shared/branch-is-wallet-connected'
import { FADE_DOWN_ANIMATION_VARIANTS } from '@/config/design'

export default function CreatePage() {
  const [step, setStep] = useState(1)

  function nextStep() {
    setStep(step + 1)
  }

  function prevStep() {
    setStep(step - 1)
  }

  return (
    <>
      <div className="relative flex flex-1">
        <div className="flex-center flex h-full flex-1 flex-col items-center justify-center">
          <motion.div
            className="min-w-full max-w-5xl px-5 xl:px-48"
            initial="hidden"
            whileInView="show"
            animate="show"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.15,
                },
              },
            }}>
            <motion.h1
              className="text-gradient-primary text-center text-3xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-4xl md:leading-[8rem]"
              variants={FADE_DOWN_ANIMATION_VARIANTS}>
              Mint Stewardship License
            </motion.h1>
            <div className="mt-8 flex min-w-fit items-center justify-center">
              <BranchIsWalletConnected>
                {step === 1 ? (
                  <ConfigStewardLicenseFacet nextStep={nextStep} />
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
                <WalletConnect />
              </BranchIsWalletConnected>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
