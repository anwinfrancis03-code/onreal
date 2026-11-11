import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icon } from './Icon';

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] grid max-w-[calc(100vw-2rem)] gap-2.5"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
            className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-white/10 bg-deep-800 px-4 py-3 text-sm text-white shadow-lift"
          >
            <span
              className={
                'mt-0.5 ' +
                (t.type === 'error' ? 'text-red-300' : t.type === 'info' ? 'text-amber-200' : 'text-lime')
              }
            >
              <Icon n={t.type === 'error' ? 'alert' : t.type === 'info' ? 'info' : 'done'} size={18} />
            </span>
            <span>{t.msg}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
