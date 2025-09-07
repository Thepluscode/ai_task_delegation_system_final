/**
 * Premium Button Component for AutomatedAIPlatform
 *
 * A sophisticated button component with multiple variants, states, animations,
 * and accessibility features.
 */

import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Create a mock haptics module to handle the case when expo-haptics is not available
// This prevents the "Cannot find module 'expo-haptics'" error
interface ImpactFeedbackStyle {
  Light: string;
  Medium: string;
  Heavy: string;
}

interface NotificationFeedbackType {
  Success: string;
  Warning: string;
  Error: string;
}

interface HapticsInterface {
  selectionAsync(): Promise<void>;
  impactAsync(style?: any): Promise<void>;
  notificationAsync(type?: any): Promise<void>;
  ImpactFeedbackStyle: ImpactFeedbackStyle;
  NotificationFeedbackType: NotificationFeedbackType;
}

// Create a mock haptics module
const Haptics: HapticsInterface = {
  selectionAsync: () => Promise.resolve(),
  impactAsync: () => Promise.resolve(),
  notificationAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy'
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error'
  }
};

// Try to import the actual haptics module if available
try {
  // This will be replaced with the actual implementation if available
  const haptics = require('expo-haptics');
  if (haptics) {
    Object.assign(Haptics, haptics);
  }
} catch (error) {
  console.warn('expo-haptics module not available, using mock implementation');
}

// Import design system foundations
import colors from '../../foundations/colors';
import motion from '../../foundations/motion';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

// Button sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Icon positions
export type IconPosition = 'left' | 'right';

// Button props
export interface ButtonProps {
  // Text content
  children: React.ReactNode;
  
  // Styling and appearance
  variant?: ButtonVariant;
  size?: ButtonSize;
  rounded?: boolean;
  fullWidth?: boolean;
  elevated?: boolean;
  
  // Icon configuration
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  
  // State management
  isDisabled?: boolean;
  isLoading?: boolean;
  isActive?: boolean;
  
  // Interaction callbacks
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Animation and feedback
  animated?: boolean;
  withHaptics?: boolean;
  hapticType?: 'selection' | 'impact' | 'notification';
  hapticIntensity?: 'light' | 'medium' | 'heavy';
  
  // Additional styling
  style?: any; // Style for the container
  textStyle?: any; // Style for the text
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  
  // Testing
  testID?: string;
}

// Default props
const defaultProps: Partial<ButtonProps> = {
  variant: 'primary',
  size: 'md',
  rounded: false,
  fullWidth: false,
  elevated: true,
  isDisabled: false,
  isLoading: false,
  isActive: false,
  animated: true,
  withHaptics: true,
  hapticType: 'impact',
  hapticIntensity: 'medium',
  gradientStart: { x: 0, y: 0 },
  gradientEnd: { x: 1, y: 0 },
};

/**
 * Premium Button Component
 */
export const Button: React.FC<ButtonProps> = (props) => {
  // Merge default props
  const {
    children,
    variant,
    size,
    rounded,
    fullWidth,
    elevated,
    leftIcon,
    rightIcon,
    iconOnly,
    isDisabled,
    isLoading,
    isActive,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    accessibilityLabel,
    accessibilityHint,
    animated,
    withHaptics,
    hapticType,
    hapticIntensity,
    style,
    textStyle,
    gradientColors,
    gradientStart,
    gradientEnd,
    testID,
  } = { ...defaultProps, ...props };

  // Animation handling
  const animation = motion.useButtonAnimation();

  // Custom press handling with haptic feedback
  const handlePressIn = () => {
    // Trigger animation if enabled
    if (animated) {
      animation.onPressIn();
    }
    
    // Trigger haptic feedback if enabled
    if (withHaptics && !isDisabled) {
      switch (hapticType) {
        case 'selection':
          Haptics.selectionAsync();
          break;
        case 'impact':
          switch (hapticIntensity) {
            case 'light':
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              break;
            case 'medium':
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              break;
            case 'heavy':
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              break;
            default:
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          break;
        case 'notification':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
      }
    }
    
    // Call the original onPressIn callback if provided
    if (onPressIn) {
      onPressIn();
    }
  };

  const handlePressOut = () => {
    // Reset animation if enabled
    if (animated) {
      animation.onPressOut();
    }
    
    // Call the original onPressOut callback if provided
    if (onPressOut) {
      onPressOut();
    }
  };

  // Get styles based on props
  const getContainerStyles = () => {
    const baseStyles: any[] = [styles.container];
    
    // Add size-specific styles
    if (size && styles[`container_${size}`]) {
      baseStyles.push(styles[`container_${size}`]);
    }
    
    // Add variant-specific styles if not using gradient
    if (!shouldUseGradient() && variant && styles[`container_${variant}`]) {
      baseStyles.push(styles[`container_${variant}`]);
    }
    
    // Add rounded styles if needed
    if (rounded) {
      baseStyles.push(styles.container_rounded);
    }
    
    // Add full width styles if needed
    if (fullWidth) {
      baseStyles.push(styles.container_fullWidth);
    }
    
    // Add icon-only styles if needed
    if (iconOnly) {
      baseStyles.push(styles.container_iconOnly);
    }
    
    // Add elevated styles if needed
    if (elevated && !isDisabled) {
      baseStyles.push(styles.container_elevated);
    }
    
    // Add active styles if needed
    if (isActive && variant && styles[`container_${variant}_active`]) {
      baseStyles.push(styles[`container_${variant}_active`]);
    }
    
    // Add disabled styles if needed
    if (isDisabled) {
      baseStyles.push(styles.container_disabled);
    }
    
    // Add custom styles if provided
    if (style) {
      baseStyles.push(style);
    }
    
    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles: any[] = [styles.text];
    
    // Add size-specific styles
    if (size) {
      baseStyles.push(styles[`text_${size}`]);
    }
    
    // Add variant-specific styles
    if (variant) {
      baseStyles.push(styles[`text_${variant}`]);
    }
    
    // Add disabled styles if needed
    if (isDisabled) {
      baseStyles.push(styles.text_disabled);
    }
    
    // Add custom text styles if provided
    if (textStyle) {
      baseStyles.push(textStyle);
    }
    
    return baseStyles;
  };

  // Determine if we should use a gradient background
  const shouldUseGradient = () => {
    return (variant === 'primary' || variant === 'secondary' || variant === 'success' || variant === 'danger') 
      && !isDisabled 
      && gradientColors !== undefined;
  };

  // Get default gradient colors based on variant
  const getGradientColors = () => {
    if (gradientColors && gradientColors.length >= 2) {
      return gradientColors;
    }
    
    switch (variant) {
      case 'primary':
        return [colors.palette.primary[600], colors.palette.primary[500]];
      case 'secondary':
        return [colors.palette.secondary[600], colors.palette.secondary[500]];
      case 'success':
        return [colors.palette.success[600], colors.palette.success[500]];
      case 'danger':
        return [colors.palette.error[600], colors.palette.error[500]];
      default:
        return [colors.palette.primary[600], colors.palette.primary[500]];
    }
  };

  // Render the button content
  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'ghost' ? colors.palette.primary[500] : '#ffffff'} 
          />
        ) : (
          <>
            {leftIcon && !iconOnly && (
              <View style={styles.leftIconContainer}>
                {leftIcon}
              </View>
            )}
            
            {iconOnly && leftIcon ? (
              leftIcon
            ) : !iconOnly && (
              <Text style={getTextStyles()}>
                {children}
              </Text>
            )}
            
            {rightIcon && !iconOnly && (
              <View style={styles.rightIconContainer}>
                {rightIcon}
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  // Render the button with or without gradient
  const renderButton = () => {
    // Create animated container style
    const containerStyle = [
      animated ? { transform: [{ scale: animation.scale }] } : {},
      getContainerStyles(),
    ];
    
    // If we should use gradient background
    if (shouldUseGradient()) {
      return (
        <Animated.View style={containerStyle}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onLongPress={onLongPress}
            disabled={isDisabled || isLoading}
            accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled || isLoading, busy: isLoading }}
            testID={testID}
          >
            <LinearGradient
              colors={getGradientColors()}
              start={gradientStart}
              end={gradientEnd}
              style={styles.gradient}
            >
              {renderContent()}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // Regular button without gradient
    return (
      <Animated.View style={containerStyle}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          disabled={isDisabled || isLoading}
          accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled || isLoading, busy: isLoading }}
          testID={testID}
          style={styles.touchable}
        >
          {renderContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render the button
  return renderButton();
};

// Component styles
const styles = StyleSheet.create({
  // Base container styles
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  // Size-specific container styles
  container_xs: {
    minHeight: 28,
    minWidth: 28,
  },
  container_sm: {
    minHeight: 36,
    minWidth: 36,
  },
  container_md: {
    minHeight: 44,
    minWidth: 44,
  },
  container_lg: {
    minHeight: 52,
    minWidth: 52,
  },
  container_xl: {
    minHeight: 60,
    minWidth: 60,
  },
  
  // Variant-specific container styles
  container_primary: {
    backgroundColor: colors.palette.primary[500],
  },
  container_secondary: {
    backgroundColor: colors.palette.secondary[500],
  },
  container_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.palette.primary[500],
  },
  container_danger: {
    backgroundColor: colors.palette.error[500],
  },
  container_success: {
    backgroundColor: colors.palette.success[500],
  },
  
  // Active state container styles
  container_primary_active: {
    backgroundColor: colors.palette.primary[600],
  },
  container_secondary_active: {
    backgroundColor: colors.palette.secondary[600],
  },
  container_ghost_active: {
    backgroundColor: colors.colors.light.button.ghostHover,
  },
  container_danger_active: {
    backgroundColor: colors.palette.error[600],
  },
  container_success_active: {
    backgroundColor: colors.palette.success[600],
  },
  
  // Special container styles
  container_rounded: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  container_fullWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  container_iconOnly: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container_elevated: {
    ...Platform.select({
      ios: {
        shadowColor: colors.palette.primary[900],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  container_disabled: {
    backgroundColor: colors.palette.neutral[200],
    opacity: 0.6,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  
  // Touchable style
  touchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Gradient style
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Content container style
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  
  // Icon container styles
  leftIconContainer: {
    marginRight: 8,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  
  // Text styles
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Size-specific text styles
  text_xs: {
    fontSize: 12,
  },
  text_sm: {
    fontSize: 14,
  },
  text_md: {
    fontSize: 16,
  },
  text_lg: {
    fontSize: 18,
  },
  text_xl: {
    fontSize: 20,
  },
  
  // Variant-specific text styles
  text_primary: {
    color: '#ffffff',
  },
  text_secondary: {
    color: '#ffffff',
  },
  text_ghost: {
    color: colors.palette.primary[500],
  },
  text_danger: {
    color: '#ffffff',
  },
  text_success: {
    color: '#ffffff',
  },
  
  // Disabled text style
  text_disabled: {
    color: colors.palette.neutral[500],
  },
});

export default Button;