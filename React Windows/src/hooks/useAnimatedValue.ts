import {useRef} from 'react';
import {Animated} from 'react-native';

export function useAnimatedValue(initial: number): Animated.Value {
  const ref = useRef(new Animated.Value(initial));
  return ref.current;
}
