import { motion, useReducedMotion } from 'framer-motion';

/* Scroll-triggered entrance animation (Framer Motion). Respects reduced-motion. */
export function Reveal({ children, delay = 0, className = '' }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: [0.22, 0.8, 0.24, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
