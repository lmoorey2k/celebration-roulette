import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path, Circle, Defs, Pattern, Rect } from 'react-native-svg';

// Subtle tiled food-themed pattern (fork + dot motif)
export function BackgroundPattern() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="food-pattern"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {/* Mini fork */}
            <G opacity="0.06" transform="translate(10, 8)">
              <Path
                d="M4 0 L4 10 Q4 14 7 14 L7 22"
                stroke="#0A4D2E"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <Path
                d="M1 0 L1 8 M4 0 L4 8 M7 0 L7 8 M1 8 Q1 11 4 11 Q7 11 7 8"
                stroke="#0A4D2E"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </G>
            {/* Dot accent */}
            <Circle cx="44" cy="16" r="2.5" fill="#C9A84C" opacity="0.1" />
            <Circle cx="16" cy="44" r="1.8" fill="#0A4D2E" opacity="0.07" />
            {/* Mini spoon */}
            <G opacity="0.06" transform="translate(36, 30)">
              <Circle cx="5" cy="4" r="4" stroke="#0A4D2E" strokeWidth="1.2" fill="none" />
              <Path
                d="M5 8 L5 20"
                stroke="#0A4D2E"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#food-pattern)" />
      </Svg>
    </View>
  );
}
