"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface AboutProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function About({ isOpen, onClose }: AboutProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 pointer-events-none"
          />

          {/* Overlay Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed md:absolute inset-0 z-50 flex items-start md:items-center justify-center md:p-10 overflow-y-auto md:overflow-visible"
            onClick={onClose}
          >
            <div
              className="bg-[#e1e1e1] flex gap-5 max-w-5xl w-full h-[85vh] md:min-h-[500px] md:h-auto md:max-h-[calc(100vh-2rem)] md:p-10 px-6 py-10 relative sans overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fila superior con cruces */}
              <div className="flex flex-col justify-between">
                <div className="relative">
                  <img src="/Plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
                <div className="relative">
                  <img src="/Plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
              </div>

              {/* Contenido centrado */}
              <div className="flex-1 flex items-start md:items-center justify-center overflow-y-auto">
                <div className="space-y-6 md:text-xl leading-6 md:leading-8 font-medium text-black-pco/50">
                  <p>
                    <strong className="text-black-pco">
                      Partial Common Ownership
                    </strong>{" "}
                    reimagines how we relate to contemporary art and creative
                    practices. As they become increasingly multifaceted – often
                    involving specialist teams, continuous R&D, technology
                    development and new approaches to distribution – their value
                    expands beyond individual artworks to include the evolving
                    intelligence of the practice itself: the studio as an active
                    system of creation.
                  </p>
                  <p>
                    PCO provides artists with a clear structure to fund and
                    sustain that capacity. It enables early supporters to take
                    part in the studio's growth—providing a clear, practical way
                    to back long-term experimentation while sharing in its
                    future outcomes. PCO doesn't replace existing models; it
                    extends and augments them by creating an expanded framework
                    to accompany the life of a practice as it moves through time
                    and contexts.
                  </p>
                  <p>
                    With PCO, art is not simply owned, but co-evolved with the
                    communities that sustain it.
                  </p>
                </div>
              </div>

              {/* Fila serifor con cruces */}
              <div className="flex flex-col justify-between">
                <div className="relative">
                  <button
                    onClick={onClose}
                    className="md:pointer-events-none cursor-pointer"
                    aria-label="Close"
                  >
                    <img
                      src="/Plus.svg"
                      alt="Close"
                      className="w-6 h-6 rotate-45 md:rotate-0"
                    />
                  </button>
                </div>
                <div className="relative">
                  <img src="/Plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
