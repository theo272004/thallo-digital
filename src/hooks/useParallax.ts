import { useMouse } from './useMouse';

export function useParallax(factor: number) {
  const mouse = useMouse();
  return {
    x: mouse.x * factor,
    y: mouse.y * factor
  };
}
