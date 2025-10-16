import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from 'react-native';
import { theme } from '@/styles/theme';

interface StyledTextProps extends RNTextProps {
  variant?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * Custom Text component that uses Poppins font by default
 */
export function StyledText({
  variant = 'regular',
  style,
  ...props
}: StyledTextProps) {
  const fontFamily = theme.typography.fontFamily[variant];

  return <RNText style={[{ fontFamily }, style]} {...props} />;
}

/**
 * Convenience components for different font weights
 */
export function TextRegular(props: RNTextProps) {
  return <StyledText variant="regular" {...props} />;
}

export function TextMedium(props: RNTextProps) {
  return <StyledText variant="medium" {...props} />;
}

export function TextSemiBold(props: RNTextProps) {
  return <StyledText variant="semibold" {...props} />;
}

export function TextBold(props: RNTextProps) {
  return <StyledText variant="bold" {...props} />;
}

export default StyledText;
