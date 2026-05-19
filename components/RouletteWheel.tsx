import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Animated,
  Easing,
  Pressable,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import type { Restaurant } from '@/hooks/useRestaurants';
import { Colors } from '@/constants/theme';
import { playTick, resumeAudio } from '@/utils/audio';

const SLICE_COLORS = [Colors.sliceBlue, Colors.sliceCream];
const SLICE_TEXT_COLORS = ['#1A3A45', '#4A3A28'];

// Main spin: ease-out cubic
const SPIN_ROTATIONS = 7;
const SPIN_MS = 5200;
// Overshoot: go slightly past winner, then settle back
const OVERSHOOT_FRACTION = 0.55; // fraction of one slice to overshoot
const SETTLE_MS = 420;

function toRad(deg: number) {
  return ((deg - 90) * Math.PI) / 180;
}
function pt(cx: number, cy: number, r: number, deg: number) {
  const rad = toRad(deg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = pt(cx, cy, r, start);
  const e = pt(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)} Z`;
}
function truncate(name: string, max: number) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

interface Props {
  pool: Restaurant[];
  spinning: boolean;
  onSpinStart: () => void;
  onSpinComplete: (winner: Restaurant) => void;
}

export function RouletteWheel({ pool, spinning, onSpinStart, onSpinComplete }: Props) {
  const { width: screenW } = useWindowDimensions();
  const SIZE = Math.min(Math.round(screenW * 0.93), 520);
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const OUTER_R = SIZE / 2 - 4;
  const BORDER_R = SIZE / 2;
  const CENTER_R = Math.round(SIZE * 0.152);

  const rotAnim = useRef(new Animated.Value(0)).current;
  const totalDeg = useRef(0);
  const listenerId = useRef('');
  const prevBoundary = useRef(0);

  const n = pool.length;
  const anglePerSlice = n > 0 ? 360 / n : 360;
  const fontSize = Math.max(6, Math.min(12, Math.floor(280 / n)));
  const maxChars = Math.max(5, Math.floor(120 / fontSize));

  useEffect(() => {
    return () => {
      if (listenerId.current) rotAnim.removeListener(listenerId.current);
    };
  }, [rotAnim]);

  const handleSpin = useCallback(() => {
    if (spinning || n === 0) return;
    resumeAudio();

    const winnerIdx = Math.floor(Math.random() * n);
    const winner = pool[winnerIdx];

    // Landing angle: winner slice center at the top pointer
    const sliceCenter = (winnerIdx + 0.5) * anglePerSlice;
    const currentMod = ((totalDeg.current % 360) + 360) % 360;
    const targetMod = ((sliceCenter % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    delta += SPIN_ROTATIONS * 360;

    const finalPos = totalDeg.current + delta;
    // Overshoot: go a fraction of a slice PAST the winner, then settle back
    const overshootPos = finalPos + anglePerSlice * OVERSHOOT_FRACTION;

    totalDeg.current = finalPos; // track real final position

    // Remove old listener
    if (listenerId.current) {
      rotAnim.removeListener(listenerId.current);
      listenerId.current = '';
    }

    // Tick on each slice crossing during main spin
    prevBoundary.current = Math.floor((rotAnim as any)._value / anglePerSlice);
    listenerId.current = rotAnim.addListener(({ value }) => {
      const b = Math.floor(value / anglePerSlice);
      if (b !== prevBoundary.current) {
        prevBoundary.current = b;
        playTick();
      }
    });

    onSpinStart();

    // Phase 1: main spin to overshoot position
    Animated.timing(rotAnim, {
      toValue: overshootPos,
      duration: SPIN_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      // Stop ticking before settle
      if (listenerId.current) {
        rotAnim.removeListener(listenerId.current);
        listenerId.current = '';
      }

      // Phase 2: settle back to exact winner slice (slight backwards motion)
      Animated.timing(rotAnim, {
        toValue: finalPos,
        duration: SETTLE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished: done }) => {
        if (done) onSpinComplete(winner);
      });
    });
  }, [spinning, n, pool, anglePerSlice, rotAnim, onSpinStart, onSpinComplete]);

  const rotate = rotAnim.interpolate({
    inputRange: [-720000, 720000],
    outputRange: ['-720000deg', '720000deg'],
  });

  return (
    <View style={[styles.container, { width: SIZE, height: SIZE }]}>
      {/* Downward-pointing pointer ▼ */}
      <View style={styles.pointer} />

      {/* Animated wheel */}
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Svg width={SIZE} height={SIZE}>
          {/* Outer gold ring */}
          <Circle cx={CX} cy={CY} r={BORDER_R - 1} fill={Colors.gold} />

          {pool.map((restaurant, i) => {
            const start = i * anglePerSlice;
            const end = (i + 1) * anglePerSlice;
            const center = start + anglePerSlice / 2;
            const color = SLICE_COLORS[i % 2];
            const textColor = SLICE_TEXT_COLORS[i % 2];
            const name = truncate(restaurant.name, maxChars);
            const svgRotate = center - 90;
            const textX = CX + CENTER_R + 8;

            return (
              <G key={restaurant.id}>
                <Path d={slicePath(CX, CY, OUTER_R, start, end)} fill={color} />
                <G transform={`rotate(${svgRotate.toFixed(3)}, ${CX}, ${CY})`}>
                  <SvgText
                    x={textX}
                    y={CY}
                    fontSize={fontSize}
                    fill={textColor}
                    fontWeight="600"
                    alignmentBaseline="middle"
                    textAnchor="start"
                  >
                    {name}
                  </SvgText>
                </G>
              </G>
            );
          })}

          {/* Divider lines */}
          {pool.map((_, i) => {
            const outer = pt(CX, CY, OUTER_R, i * anglePerSlice);
            return (
              <Path
                key={`d${i}`}
                d={`M ${CX} ${CY} L ${outer.x.toFixed(2)} ${outer.y.toFixed(2)}`}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={0.8}
              />
            );
          })}

          {/* Center white cap */}
          <Circle cx={CX} cy={CY} r={CENTER_R} fill={Colors.surface} />
          <Circle cx={CX} cy={CY} r={CENTER_R} fill="none" stroke={Colors.gold} strokeWidth={2.5} />
        </Svg>
      </Animated.View>

      {/* Center SPIN button — stationary, gold */}
      <Pressable
        style={({ pressed }) => [
          styles.centerBtn,
          { width: CENTER_R * 2, height: CENTER_R * 2, borderRadius: CENTER_R },
          pressed && styles.pressed,
          spinning && styles.spinning,
        ]}
        onPress={handleSpin}
        disabled={spinning || n === 0}
        accessibilityRole="button"
        accessibilityLabel="Spin the wheel"
      >
        <Text style={[styles.centerBtnText, { fontSize: Math.round(SIZE * 0.044) }]}>
          {spinning ? '…' : 'SPIN'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ▼ downward triangle pointer
  pointer: {
    position: 'absolute',
    top: 2,
    zIndex: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 26,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 8,
  },
  centerBtn: {
    position: 'absolute',
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  pressed: {
    backgroundColor: Colors.goldDark,
    transform: [{ scale: 0.94 }],
  },
  spinning: {
    backgroundColor: Colors.goldLight,
  },
  centerBtnText: {
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
