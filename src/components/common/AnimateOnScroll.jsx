// components/common/AnimateOnScroll.jsx — scroll-triggered and element animations
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const defaultFadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

const defaultFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const defaultScale = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
};

const defaultSlideLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
};

const defaultSlideRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
};

const defaultTransition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
const viewport = { once: true, amount: 0.15, margin: '0px 0px -40px 0px' };

/**
 * Wraps children and animates when scrolled into view.
 * @param {string} variant - 'fadeUp' | 'fadeIn' | 'scale' | 'slideLeft' | 'slideRight'
 * @param {number} delay - delay in seconds
 */
export const AnimateOnScroll = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  className = '',
  as = 'div',
  ...props
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, viewport);

  const variants = {
    fadeUp: defaultFadeUp,
    fadeIn: defaultFadeIn,
    scale: defaultScale,
    slideLeft: defaultSlideLeft,
    slideRight: defaultSlideRight,
  };

  const v = variants[variant] || defaultFadeUp;
  const Component = motion[as] || motion.div;

  return (
    <Component
      ref={ref}
      initial={v.initial}
      animate={inView ? v.animate : v.initial}
      transition={{ ...defaultTransition, delay }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  );
};

/** Stagger container: wrap a list and pass staggerChildren to children */
export const StaggerContainer = ({ children, className = '', delayChildren = 0, staggerChildren = 0.08, style, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, viewport);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren, delayChildren },
        },
      }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

/** Single item variant for use inside StaggerContainer */
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default AnimateOnScroll;
