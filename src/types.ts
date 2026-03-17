export interface SmoothPageOptions {
  scrollingSpeed?: number;
  easing?: string;
  animation?: 'default' | 'zoom' | 'slide-up' | 'parallax';
  navigation?: boolean;
  arrows?: boolean;
  onLeave?: (index: number, nextIndex: number) => void;
  afterLoad?: (index: number) => void;
  onSlideLeave?: (sectionIndex: number, slideIndex: number, nextSlideIndex: number) => void;
  afterSlideLoad?: (sectionIndex: number, slideIndex: number) => void;
}

export interface SlideData {
  container: HTMLElement | null;
  items: HTMLElement[];
  currentIndex: number;
}
