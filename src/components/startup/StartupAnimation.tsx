import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StartupAnimationProps {
  onComplete: () => void;
  disabled?: boolean;
}

export function StartupAnimation({
  onComplete,
  disabled = false,
}: StartupAnimationProps) {
  const [animationPhase, setAnimationPhase] = useState<"enter" | "fade-out">(
    "enter"
  );

  useEffect(() => {
    // If disabled, immediately call onComplete
    if (disabled) {
      onComplete();
      return;
    }

    const timer1 = setTimeout(() => setAnimationPhase("fade-out"), 5500);
    const timer2 = setTimeout(onComplete, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete, disabled]);

  // If disabled, don't render anything
  if (disabled) {
    return null;
  }

  return (
    <>
      {/* Persistent white background that stays during entire transition */}
      <div className="fixed inset-0 bg-white z-50" />

      {/* Content that fades out */}
      <AnimatePresence>
        {animationPhase !== "fade-out" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {/* Ollama Logo */}
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2,
              }}
              className="relative"
            >
              <motion.img
                src="https://images.seeklogo.com/logo-png/59/2/ollama-logo-png_seeklogo-593420.png"
                alt="Ollama Logo"
                className="w-16 h-16 object-contain"
              />
            </motion.div>

            {/* Ollama UI Text */}
            <motion.div
              initial={{
                y: 100,
                opacity: 0,
                scale: 0.8,
                filter: "blur(10px)",
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2,
              }}
              className="ml-4 text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
            >
              Ollama UI
            </motion.div>

            {/* Loading Indicator */}
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="flex flex-col items-center gap-3">
                {/* Spinning loader */}
                <motion.div
                  className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />

                {/* <motion.span
                  className="text-sm text-gray-500 font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Loading...
                </motion.span> */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
