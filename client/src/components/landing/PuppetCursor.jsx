/**
 * PuppetCursor - Animated Fake Cursor Component
 * 
 * A visual cursor that moves to specific coordinates during scroll-driven demos.
 * Used to simulate user interaction for the landing page feature tours.
 */

import { motion } from 'framer-motion'

export function PuppetCursor({
    x = 0,
    y = 0,
    visible = true,
    clicking = false
}) {
    return (
        <motion.div
            className="pointer-events-none absolute z-50"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                x,
                y,
                opacity: visible ? 1 : 0,
                scale: clicking ? 0.9 : 1,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 }
            }}
        >
            {/* Cursor SVG - Classic pointer arrow */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-lg"
            >
                <path
                    d="M5.5 3.21V20.79C5.5 21.35 6.22 21.63 6.63 21.22L10.5 16.5H18.79C19.24 16.5 19.46 15.95 19.14 15.63L6.14 2.63C5.82 2.31 5.5 2.65 5.5 3.21Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="1.5"
                />
            </svg>

            {/* Click ripple effect */}
            {clicking && (
                <motion.div
                    className="absolute top-0 left-0 w-8 h-8 rounded-full border-2 border-white/50"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                />
            )}
        </motion.div>
    )
}
