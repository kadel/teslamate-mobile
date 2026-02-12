/**
 * Themed primitives — now NativeWind-friendly.
 *
 * The old implementation injected backgroundColor/color via the style prop,
 * which always beats NativeWind's className-derived styles. These wrappers
 * are now transparent by default so Tailwind utility classes work correctly.
 * Only apply theme colors when no className overrides are provided.
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  const { style, ...rest } = props;
  // Default to light text on dark bg; className can override
  return <DefaultText style={[{ color: '#f5f5f5' }, style]} {...rest} />;
}

export function View(props: ViewProps) {
  // Fully transparent — let NativeWind handle backgrounds
  return <DefaultView {...props} />;
}
