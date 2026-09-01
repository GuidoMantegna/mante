import { type Sketch } from "@/components/svg-drawing";
import {
  ICON_SKETCH_STROKE_WIDTH,
  ICON_SKETCH_VIEW_BOX,
} from "@/components/sketchs/icon-sketch";

// Orden de dibujo: cajones con su tirador (arriba, abajo) -> estantes de arriba
// hacia abajo. El SVG original repite cajones y tiradores; acá aparecen una vez.
export const VESTIDOR_ICON_SKETCH_PATHS = [
  "M0.73 0.92H213.19V49.12H0.73Z",
  "M79.32 23.86L134.6 23.86",
  "M0.73 50.58H213.19V98.78H0.73Z",
  "M79.32 73.53L134.6 73.53",
  "M260.81 12.64H392.67A6.59 6.59 0 0 1 399.27 19.23V33.88A6.59 6.59 0 0 1 392.67 40.48H260.81A6.59 6.59 0 0 1 254.21 33.88V19.23A6.59 6.59 0 0 1 260.81 12.64Z",
  "M260.81 41.94H392.67A6.59 6.59 0 0 1 399.27 48.53V63.19A6.59 6.59 0 0 1 392.67 69.78H260.81A6.59 6.59 0 0 1 254.21 63.19V48.53A6.59 6.59 0 0 1 260.81 41.94Z",
  "M260.81 71.25H392.67A6.59 6.59 0 0 1 399.27 77.84V92.49A6.59 6.59 0 0 1 392.67 99.08H260.81A6.59 6.59 0 0 1 254.21 92.49V77.84A6.59 6.59 0 0 1 260.81 71.25Z",
] as const;

export const VESTIDOR_ICON_SKETCH: Sketch = {
  paths: VESTIDOR_ICON_SKETCH_PATHS,
  viewBox: ICON_SKETCH_VIEW_BOX,
  strokeWidth: ICON_SKETCH_STROKE_WIDTH,
  title: "Ícono de vestidores",
};
