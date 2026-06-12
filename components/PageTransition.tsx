'use client'

import { motion } from 'framer-motion'

// Standard page entrance: opacity 0→1 + y 12→0 over 0.35s.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-1 flex-col gap-6"
    >
      {children}
    </motion.div>
  )
}
