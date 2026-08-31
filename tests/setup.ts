import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";

const REDUCED_MOTION_FEATURE = "prefers-reduced-motion";

type MediaQueryListener =
  | ((event: MediaQueryListEvent) => void)
  | { handleEvent: (event: MediaQueryListEvent) => void }
  | null;

let reducedMotionEnabled = false;

const mediaQueryLists = new Map<string, MediaQueryList>();
const listenersByQuery = new Map<string, Set<MediaQueryListener>>();

function createMediaQueryList(query: string): MediaQueryList {
  const listeners = new Set<MediaQueryListener>();
  listenersByQuery.set(query, listeners);

  const add = (listener: MediaQueryListener) => {
    if (listener) listeners.add(listener);
  };
  const remove = (listener: MediaQueryListener) => {
    if (listener) listeners.delete(listener);
  };

  return {
    get matches() {
      return query.includes(REDUCED_MOTION_FEATURE) && reducedMotionEnabled;
    },
    media: query,
    onchange: null,
    addListener: add,
    removeListener: remove,
    addEventListener: (_type: string, listener: MediaQueryListener) =>
      add(listener),
    removeEventListener: (_type: string, listener: MediaQueryListener) =>
      remove(listener),
    dispatchEvent: () => false,
  } as unknown as MediaQueryList;
}

// jsdom no implementa `window.matchMedia`, del que depende `useReducedMotion`.
// Es un polyfill de entorno, no un mock del componente ni del DOM.
window.matchMedia = (query: string): MediaQueryList => {
  let mediaQueryList = mediaQueryLists.get(query);

  if (!mediaQueryList) {
    mediaQueryList = createMediaQueryList(query);
    mediaQueryLists.set(query, mediaQueryList);
  }

  return mediaQueryList;
};

export function setReducedMotion(enabled: boolean): void {
  if (enabled === reducedMotionEnabled) return;

  reducedMotionEnabled = enabled;

  // Motion registra su listener de `change` una sola vez por módulo, así que la
  // preferencia solo se propaga si el polyfill emite el evento de verdad.
  for (const [query, listeners] of listenersByQuery) {
    if (!query.includes(REDUCED_MOTION_FEATURE)) continue;

    const event = new Event("change") as MediaQueryListEvent;

    for (const listener of listeners) {
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener?.handleEvent(event);
      }
    }
  }
}

beforeEach(() => {
  setReducedMotion(false);
});

// jsdom no implementa `IntersectionObserver`, del que depende `whileInView`.
// El stub guarda cada instancia para que los tests disparen la intersección
// a mano con `triggerIntersection`.
type IntersectionCallback = (entries: IntersectionObserverEntry[]) => void;

const observers = new Set<{
  callback: IntersectionCallback;
  elements: Set<Element>;
}>();

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  private elements = new Set<Element>();
  private entry: { elements: Set<Element>; callback: IntersectionCallback };

  constructor(callback: IntersectionCallback) {
    this.entry = { elements: this.elements, callback };
    observers.add(this.entry);
  }

  observe(element: Element): void {
    this.elements.add(element);
  }

  unobserve(element: Element): void {
    this.elements.delete(element);
  }

  disconnect(): void {
    observers.delete(this.entry);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

window.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

export function triggerIntersection(
  element: Element,
  isIntersecting: boolean,
): void {
  for (const { elements, callback } of observers) {
    if (!elements.has(element)) continue;

    callback([
      {
        isIntersecting,
        target: element,
        intersectionRatio: isIntersecting ? 1 : 0,
      } as IntersectionObserverEntry,
    ]);
  }
}
