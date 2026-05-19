import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');
const PARTICLE_COUNT = 70;
const DURATION_BASE = 2200;

const COLORS = [
  '#3B8A9E', '#FFFFFF', '#C9A84C', '#7EC8D8',
  '#E2F4F8', '#F0EBE1', '#A8D8E8', '#E8F8FC',
];

interface Particle {
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  anim: Animated.Value;
  rotAnim: Animated.Value;
}

interface Props {
  active: boolean;
}

export function Confetti({ active }: Props) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * W,
      color: COLORS[i % COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 600,
      duration: DURATION_BASE + Math.random() * 1000,
      anim: new Animated.Value(0),
      rotAnim: new Animated.Value(0),
    }));
  }, []);

  const animationsRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      particles.forEach((p) => {
        p.anim.setValue(0);
        p.rotAnim.setValue(0);
      });

      animationsRef.current = Animated.parallel(
        particles.map((p) =>
          Animated.sequence([
            Animated.delay(p.delay),
            Animated.parallel([
              Animated.timing(p.anim, {
                toValue: 1,
                duration: p.duration,
                useNativeDriver: true,
              }),
              Animated.timing(p.rotAnim, {
                toValue: 1,
                duration: p.duration,
                useNativeDriver: true,
              }),
            ]),
          ])
        )
      );
      animationsRef.current.start();
    } else {
      if (animationsRef.current) {
        animationsRef.current.stop();
        animationsRef.current = null;
      }
      particles.forEach((p) => {
        p.anim.setValue(0);
        p.rotAnim.setValue(0);
      });
    }

    return () => {
      if (animationsRef.current) {
        animationsRef.current.stop();
      }
    };
  }, [active, particles]);

  if (!active) return null;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {particles.map((p, i) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, H + 40],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.7, 1],
          outputRange: [1, 1, 0],
        });
        const rotate = p.rotAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${360 * (2 + Math.random() * 3)}deg`],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.size * (0.4 + Math.random() * 0.6),
                backgroundColor: p.color,
                borderRadius: i % 3 === 0 ? p.size / 2 : 2,
                opacity,
                transform: [{ translateY }, { translateX }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 200,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
