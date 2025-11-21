"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface SignUpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignUp({ isOpen, onClose }: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Reset messages when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/brevo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const error =
          data?.error?.message ??
          data?.error ??
          (response.status === 409
            ? "You are already registered."
            : "Failed to register your contact.");
        throw new Error(typeof error === "string" ? error : "Unknown error.");
      }

      // Show success message
      setSuccessMessage(
        "Thank you! Your contact has been registered successfully."
      );
      setName("");
      setEmail("");

      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="fixed md:absolute inset-0 z-50 flex items-start md:items-center justify-center md:p-10"
            onClick={onClose}
          >
            <div
              className="bg-[#e1e1e1] flex gap-5 max-w-5xl w-full h-[85vh] md:min-h-[500px] md:max-h-[90vh] md:h-auto md:p-10 px-6 py-10 relative sans"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fila superior con cruces */}
              <div className="flex flex-col justify-between">
                <div className="relative">
                  <img src="/plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
                <div className="relative">
                  <img src="/plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
              </div>

              {/* Contenido centrado */}
              <div className="flex-1 flex items-center justify-center overflow-y-auto">
                <form
                  onSubmit={handleSubmit}
                  className="w-full space-y-8 bg-[#e1e1e1] md:p-8"
                >
                  <div>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full bg-transparent border-0 border-b border-black-pco/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-black transition-colors pb-2 text-black-pco placeholder:text-black-pco/30 placeholder:font-sans"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="w-full bg-transparent border-0 border-b border-black-pco/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-black transition-colors pb-2 text-black-pco placeholder:text-black-pco/30 placeholder:font-sans"
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-sm text-red-600 sans">{errorMessage}</p>
                  )}
                  {successMessage && (
                    <p className="text-sm text-green-600 sans">
                      {successMessage}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 hover:bg-green-pco transition-colors cursor-pointer mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <span className="text-black text-2xl font-light underline font-serif">
                      Send
                    </span>
                    <img src="/Arrow.svg" alt="arrow-right" />
                  </button>
                </form>
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
                      src="/plus.svg"
                      alt="Close"
                      className="w-6 h-6 rotate-45 md:rotate-0"
                    />
                  </button>
                </div>
                <div className="relative">
                  <img src="/plus.svg" alt="Plus" className="w-6 h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
