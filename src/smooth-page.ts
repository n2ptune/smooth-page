import './smooth-page.css';

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

interface SlideData {
  container: HTMLElement | null;
  items: HTMLElement[];
  currentIndex: number;
}

class SmoothPage {
  private container: HTMLElement;
  private options: Required<SmoothPageOptions>;
  private sections: HTMLElement[];
  private totalSections: number;
  private currentIndex: number = 0;
  private isScrolling: boolean = false;
  private touchStart = { x: 0, y: 0 };
  private slidesData: SlideData[];
  private navLinks: NodeListOf<HTMLAnchorElement> | null = null;

  constructor(selector: string, options: SmoothPageOptions = {}) {
    const el = document.querySelector(selector);
    if (!(el instanceof HTMLElement)) {
      throw new Error(`SmoothPage: Element '${selector}' not found or is not an HTMLElement.`);
    }
    this.container = el;

    this.options = {
      scrollingSpeed: 700,
      easing: 'ease-in-out',
      animation: 'default',
      navigation: true,
      arrows: true,
      onLeave: () => {},
      afterLoad: () => {},
      onSlideLeave: () => {},
      afterSlideLoad: () => {},
      ...options
    } as Required<SmoothPageOptions>;

    this.sections = Array.from(this.container.querySelectorAll<HTMLElement>('.sp-section'));
    this.totalSections = this.sections.length;

    this.slidesData = this.sections.map(section => {
      const container = section.querySelector<HTMLElement>('.sp-slides');
      const items = container ? Array.from(container.querySelectorAll<HTMLElement>('.sp-slide')) : [];
      return { container, items, currentIndex: 0 };
    });

    this._init();
  }

  private _init(): void {
    document.documentElement.classList.add('sp-activated');
    document.body.classList.add('sp-activated');

    this.container.classList.add('sp-container');
    this.setOptions(this.options);

    if (this.options.navigation) this._createNavigation();
    this._initSlides();

    window.addEventListener('wheel', (e) => this._handleWheel(e), { passive: false });
    window.addEventListener('keydown', (e) => this._handleKeydown(e));
    window.addEventListener('touchstart', (e) => {
      this.touchStart.x = e.touches[0].clientX;
      this.touchStart.y = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => this._handleTouchMove(e), { passive: false });

    this.updateActiveState();
  }

  public setOptions(newOptions: SmoothPageOptions): void {
    this.options = { ...this.options, ...newOptions } as Required<SmoothPageOptions>;

    const animationClasses = ['sp-animation-default', 'sp-animation-zoom', 'sp-animation-slide-up', 'sp-animation-parallax'];
    this.container.classList.remove(...animationClasses);
    this.container.classList.add(`sp-animation-${this.options.animation}`);

    if (this.options.animation === 'slide-up') {
      this.container.style.transform = 'none';
    }

    this.applyStyles();
  }

  private applyStyles(): void {
    const duration = `${this.options.scrollingSpeed}ms`;
    const easing = this.options.easing;

    this.container.style.transition = `transform ${duration} ${easing}`;
    this.sections.forEach(section => {
      section.style.transition = `all ${duration} ${easing}`;
    });
  }

  private _initSlides(): void {
    this.slidesData.forEach((data, sectionIndex) => {
      if (data.items.length > 0 && this.options.arrows) {
        this._createSlideControls(this.sections[sectionIndex], sectionIndex);
      }
    });
  }

  private _createSlideControls(section: HTMLElement, sectionIndex: number): void {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'sp-control-arrow sp-prev';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.onclick = () => this.moveSlideLeft(sectionIndex);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'sp-control-arrow sp-next';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.onclick = () => this.moveSlideRight(sectionIndex);

    section.appendChild(prevBtn);
    section.appendChild(nextBtn);
  }

  private _createNavigation(): void {
    const nav = document.createElement('div');
    nav.className = 'sp-nav';
    const ul = document.createElement('ul');
    for (let i = 0; i < this.totalSections; i++) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.onclick = (e) => {
        e.preventDefault();
        this.moveTo(i);
      };
      li.appendChild(a);
      ul.appendChild(li);
    }
    nav.appendChild(ul);
    document.body.appendChild(nav);
    this.navLinks = nav.querySelectorAll<HTMLAnchorElement>('a');
  }

  private _handleWheel(event: WheelEvent): void {
    event.preventDefault();
    if (this.isScrolling) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      if (event.deltaY > 0) this.next(); else this.prev();
    } else {
      if (event.deltaX > 0) this.moveSlideRight(this.currentIndex);
      else if (event.deltaX < 0) this.moveSlideLeft(this.currentIndex);
    }
  }

  private _handleKeydown(event: KeyboardEvent): void {
    if (this.isScrolling) return;
    switch (event.key) {
    case 'ArrowDown': this.next(); break;
    case 'ArrowUp': this.prev(); break;
    case 'ArrowRight': this.moveSlideRight(this.currentIndex); break;
    case 'ArrowLeft': this.moveSlideLeft(this.currentIndex); break;
    }
  }

  private _handleTouchMove(event: TouchEvent): void {
    if (this.isScrolling) return;
    event.preventDefault();
    const dx = this.touchStart.x - event.touches[0].clientX;
    const dy = this.touchStart.y - event.touches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 50) dx > 0 ? this.moveSlideRight(this.currentIndex) : this.moveSlideLeft(this.currentIndex);
    } else {
      if (Math.abs(dy) > 50) dy > 0 ? this.next() : this.prev();
    }
  }

  public moveTo(index: number): void {
    if (index < 0 || index >= this.totalSections || (index === this.currentIndex && !this.isScrolling)) return;

    this.isScrolling = true;
    const prevIndex = this.currentIndex;
    this.currentIndex = index;

    this.options.onLeave(prevIndex, index);

    if (this.options.animation !== 'slide-up') {
      const translateY = -(index * 100);
      this.container.style.transform = `translateY(${translateY}%)`;
    } else {
      this.container.style.transform = 'none';
    }

    this.updateActiveState();

    setTimeout(() => {
      this.isScrolling = false;
      this.options.afterLoad(index);
    }, this.options.scrollingSpeed);
  }

  public moveToSlide(sectionIndex: number, slideIndex: number): void {
    const data = this.slidesData[sectionIndex];
    if (!data || !data.container || slideIndex < 0 || slideIndex >= data.items.length || slideIndex === data.currentIndex) return;

    this.isScrolling = true;
    const prevSlideIndex = data.currentIndex;
    data.currentIndex = slideIndex;

    this.options.onSlideLeave(sectionIndex, prevSlideIndex, slideIndex);

    const translateX = -(slideIndex * 100);
    data.container.style.transform = `translateX(${translateX}%)`;

    this.updateActiveState();

    setTimeout(() => {
      this.isScrolling = false;
      this.options.afterSlideLoad(sectionIndex, slideIndex);
    }, this.options.scrollingSpeed);
  }

  public moveSlideRight(sectionIndex: number): void {
    const data = this.slidesData[sectionIndex];
    if (data && data.currentIndex < data.items.length - 1) this.moveToSlide(sectionIndex, data.currentIndex + 1);
  }

  public moveSlideLeft(sectionIndex: number): void {
    const data = this.slidesData[sectionIndex];
    if (data && data.currentIndex > 0) this.moveToSlide(sectionIndex, data.currentIndex - 1);
  }

  public next(): void { this.moveTo(this.currentIndex + 1); }
  public prev(): void { this.moveTo(this.currentIndex - 1); }

  private updateActiveState(): void {
    this.sections.forEach((section, i) => {
      section.classList.remove('sp-past', 'sp-future', 'active');

      if (i < this.currentIndex) {
        section.classList.add('sp-past');
      } else if (i === this.currentIndex) {
        section.classList.add('active');
      } else {
        section.classList.add('sp-future');
      }

      const data = this.slidesData[i];
      if (data.items.length > 0) {
        data.items.forEach((slide, si) => {
          slide.classList.toggle('active', i === this.currentIndex && si === data.currentIndex);
        });
      }
    });

    if (this.navLinks) {
      this.navLinks.forEach((link, i) => {
        link.classList.toggle('active', i === this.currentIndex);
      });
    }
  }
}

declare global {
  interface Window {
    SmoothPage: typeof SmoothPage;
  }
}

if (typeof window !== 'undefined') window.SmoothPage = SmoothPage;
export default SmoothPage;
