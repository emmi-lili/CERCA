'use client'

import { motion } from 'framer-motion'

// Standard page entrance. initial={false} avoids a blank flash on re-mount.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-1 flex-col gap-6"
    >
      {children}
    </motion.div>
  )
}
