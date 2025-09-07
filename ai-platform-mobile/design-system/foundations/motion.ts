/**
 * Premium Motion System for AutomatedAIPlatform
 *
 * A sophisticated animation system with timing functions, presets, and hooks
 * to create consistent, delightful interactions throughout the application.
 */

import { Animated, Easing } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';

// Animation timing configurations
export const timing = {
  // Duration configurations in milliseconds
  duration: {
    instant: 50,     // For immediate feedback
    fast: 150,       // For micro-interactions
    normal: 250,     // Default for most animations
    slow: 350,       // For emphasizing importance
    deliberate: 500, // For major transitions
  },
  
  // Easing functions for natural motion
  easing: {
    // Standard easing curves
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),    // Material Design standard
    accelerate: Easing.bezier(0.4, 0.0, 1.0, 1.0), // Start slow, end fast
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1.0), // Start fast, end slow
    
    // Specialized easing curves
    emphasized: Easing.bezier(0.0, 0.0, 0.2, 1.3),  // With slight overshoot
    energetic: Easing.bezier(0.2, -0.3, 0.2, 1.4),  // Bouncy, playful
    precise: Easing.bezier(0.4, 0.0, 0.2, 1.0),     // Controlled, exact
    
    // Composite easings
    elastic: Easing.elastic(0.7),       // Elastic bounce
    bounce: Easing.bounce,              // Bouncy end
    spring: (velocity = 5) => Easing.bezier(0.1, velocity, 0.1, 1.0), // Spring-like
  },
  
  // Delay configurations
  delay: {
    none: 0,
    minimal: 50,
    short: 100,
    medium: 200,
    long: 500,
  },
};

// Animation presets for common UI patterns
export const presets = {
  // Entrance animations
  fadeIn: {
    opacity: {
      from: 0,
      to: 1,
    },
    duration: timing.duration.normal,
    easing: timing.easing.standard,
  },
  
  fadeInUp: {
    opacity: {
      from: 0,
      to: 1,
    },
    translateY: {
      from: 20,
      to: 0,
    },
    duration: timing.duration.normal,
    easing: timing.easing.standard,
  },
  
  scaleIn: {
    opacity: {
      from: 0,
      to: 1,
    },
    scale: {
      from: 0.9,
      to: 1,
    },
    duration: timing.duration.normal,
    easing: timing.easing.standard,
  },
  
  // Exit animations
  fadeOut: {
    opacity: {
      from: 1,
      to: 0,
    },
    duration: timing.duration.fast,
    easing: timing.easing.accelerate,
  },
  
  fadeOutDown: {
    opacity: {
      from: 1,
      to: 0,
    },
    translateY: {
      from: 0,
      to: 20,
    },
    duration: timing.duration.fast,
    easing: timing.easing.accelerate,
  },
  
  // Attention animations
  pulse: {
    scale: {
      sequence: [1, 1.1, 1],
    },
    duration: timing.duration.normal,
    easing: timing.easing.standard,
  },
  
  shake: {
    translateX: {
      sequence: [0, -5, 5, -5, 5, -3, 3, -1, 1, 0],
    },
    duration: timing.duration.normal,
    easing: timing.easing.standard,
  },
  
  // Button animations
  buttonPress: {
    scale: {
      from: 1,
      to: 0.96,
    },
    duration: timing.duration.fast,
    easing: timing.easing.standard,
  },
  
  buttonRelease: {
    scale: {
      from: 0.96,
      to: 1,
    },
    duration: timing.duration.fast,
    easing: timing.easing.standard,
  },
  
  // List item animations
  listItemEntrance: {
    opacity: {
      from: 0,
      to: 1,
    },
    translateX: {
      from: -20,
      to: 0,
    },
    duration: timing.duration.normal,
    easing: timing.easing.decelerate,
  },
};

// Staggered animation configuration
export const stagger = {
  // Default stagger options
  default: {
    delay: 50, // Delay between each item
    maxDelay: 1000, // Maximum total delay
  },
  
  // Stagger presets
  presets: {
    fast: {
      delay: 25,
      maxDelay: 500,
    },
    normal: {
      delay: 50,
      maxDelay: 1000,
    },
    slow: {
      delay: 100,
      maxDelay: 2000,
    },
  },
  
  // Stagger patterns
  patterns: {
    sequential: (index: number, delay: number) => index * delay,
    exponential: (index: number, delay: number) => Math.pow(1.5, index) * delay,
    fibonacci: (index: number, delay: number) => {
      const fib = (n: number): number => n <= 1 ? n : fib(n - 1) + fib(n - 2);
      return fib(index + 1) * delay;
    },
  },
};

// Animation hooks for React components

/**
 * Hook to animate a value change
 */
export const useAnimatedValue = (initialValue: number) => {
  return useRef(new Animated.Value(initialValue)).current;
};

/**
 * Hook to animate opacity from 0 to 1 on mount
 */
export const useFadeIn = (
  duration = timing.duration.normal, 
  delay = timing.delay.none, 
  easing = timing.easing.standard
) => {
  const opacity = useAnimatedValue(0);
  
  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      easing,
      useNativeDriver: true,
    }).start();
    
    return () => {
      opacity.setValue(0);
    };
  }, []);
  
  return opacity;
};

/**
 * Hook to animate entrance with fade and translation
 */
export const useEntranceAnimation = (
  duration = timing.duration.normal,
  delay = timing.delay.none,
  easing = timing.easing.standard,
  translateY = 20
) => {
  const opacity = useAnimatedValue(0);
  const translateYAnim = useAnimatedValue(translateY);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => {
      opacity.setValue(0);
      translateYAnim.setValue(translateY);
    };
  }, []);
  
  return {
    opacity,
    translateY: translateYAnim,
    style: {
      opacity,
      transform: [{ translateY: translateYAnim }],
    },
  };
};

/**
 * Hook to create a staggered animation for lists
 */
export const useStaggeredAnimation = (
  itemCount: number,
  staggerDelay = stagger.default.delay,
  animation: {
    opacity?: { from: number; to: number };
    translateY?: { from: number; to: number };
    scale?: { from: number; to: number };
    duration: number;
    easing: any;
  } = presets.fadeInUp,
  pattern = stagger.patterns.sequential
) => {
  return useMemo(() => {
    return Array.from({ length: itemCount }).map((_, index) => {
      const delay = pattern(index, staggerDelay);
      
      // Create animated values for this item
      const opacityAnim = useAnimatedValue(animation.opacity?.from || 0);
      const translateYAnim = animation.translateY ? useAnimatedValue(animation.translateY.from) : undefined;
      const scaleAnim = animation.scale ? useAnimatedValue(animation.scale.from) : undefined;
      
      return {
        opacity: opacityAnim,
        translateY: translateYAnim,
        scale: scaleAnim,
        animate: () => {
          const animationSequence: any[] = [];
          
          if (animation.opacity) {
            animationSequence.push(
              Animated.timing(opacityAnim, {
                toValue: animation.opacity.to,
                duration: animation.duration,
                delay,
                easing: animation.easing,
                useNativeDriver: true,
              })
            );
          }
          
          if (animation.translateY && translateYAnim) {
            animationSequence.push(
              Animated.timing(translateYAnim, {
                toValue: animation.translateY.to,
                duration: animation.duration,
                delay,
                easing: animation.easing,
                useNativeDriver: true,
              })
            );
          }
          
          if (animation.scale && scaleAnim) {
            animationSequence.push(
              Animated.timing(scaleAnim, {
                toValue: animation.scale.to,
                duration: animation.duration,
                delay,
                easing: animation.easing,
                useNativeDriver: true,
              })
            );
          }
          
          Animated.parallel(animationSequence).start();
        },
        style: () => {
          const style: any = {
            opacity: opacityAnim,
          };
          
          const transform = [];
          
          if (animation.translateY && translateYAnim) {
            transform.push({ translateY: translateYAnim });
          }
          
          if (animation.scale && scaleAnim) {
            transform.push({ scale: scaleAnim });
          }
          
          if (transform.length > 0) {
            style.transform = transform;
          }
          
          return style;
        },
      };
    });
  }, [itemCount]);
};

/**
 * Hook to animate a button press interaction
 */
export const useButtonAnimation = () => {
  const scale = useAnimatedValue(1);
  
  const onPressIn = () => {
    Animated.timing(scale, {
      toValue: 0.96,
      duration: timing.duration.fast,
      easing: timing.easing.standard,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: timing.duration.fast,
      easing: timing.easing.standard,
      useNativeDriver: true,
    }).start();
  };
  
  return {
    scale,
    onPressIn,
    onPressOut,
    style: {
      transform: [{ scale }],
    },
  };
};

/**
 * Hook to create a sequence animation (one after another)
 */
export const useSequenceAnimation = (
  animations: any[], // Using any[] for animation compatibility
  autoStart = true
) => {
  const sequence = Animated.sequence(animations);
  
  useEffect(() => {
    if (autoStart) {
      sequence.start();
    }
    
    return () => {
      sequence.stop();
    };
  }, [autoStart]);
  
  return {
    start: () => sequence.start(),
    stop: () => sequence.stop(),
    reset: () => {
      sequence.stop();
      sequence.reset();
    },
  };
};

// Export the entire motion system
export default {
  timing,
  presets,
  stagger,
  useAnimatedValue,
  useFadeIn,
  useEntranceAnimation,
  useStaggeredAnimation,
  useButtonAnimation,
  useSequenceAnimation,
};