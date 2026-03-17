import { SmoothPageOptions, SlideData } from './types';

/**
 * SmoothPage: A high-performance full-page scroll library.
 * Implements Mediator and Observer patterns for decoupling core logic from UI.
 */
class SmoothPage {
  private readonly container: HTMLElement;
  private readonly sections: HTMLElement[];
  private readonly totalSections: number;
  private readonly slidesData: SlideData[] = [];

  private currentIndex: number = 0;
  private isScrolling: boolean = false;
  private touchStart = { x: 0, y: 0 };
  private navLinks: HTMLElement[] = [];

  private options: Required<SmoothPageOptions> = {
    scrollingSpeed: 700,
    easing: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    animation: 'default',
    navigation: true,
    arrows: true,
    onLeave: () => {},
    afterLoad: () => {},
    onSlideLeave: () => {},
    afterSlideLoad: () => {}
  };

  constructor(selector: string, options: SmoothPageOptions = {}) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`[SmoothPage] Selector "${selector}" not found.`);

    this.container = el as HTMLElement;
    this.sections = Array.from(this.container.querySelectorAll<HTMLElement>('.sp-section'));
    this.totalSections = this.sections.length;
    this.options = { ...this.options, ...options };

    this._initialize();
  }

  /** Core Initialization */
  private _initialize(): void {
    this._setupDOM();
    this._initSlides();
    if (this.options.navigation) this._createNavigation();
    this._bindEvents();

    // Sync initial state
    this.setOptions(this.options);
    this._updateActiveState();
  }

  private _setupDOM(): void {
    this.container.classList.add('sp-container');
    document.body.classList.add('sp-activated');
  }

  /** UI Component: Horizontal Slides */
  private _initSlides(): void {
    this.sections.forEach((section, sectionIndex) => {
      const container = section.querySelector<HTMLElement>('.sp-slides');
      const items = Array.from(section.querySelectorAll<HTMLElement>('.sp-slide'));

      this.slidesData[sectionIndex] = { container, items, currentIndex: 0 };

      if (items.length > 0 && this.options.arrows) {
        this._createSlideControls(section, sectionIndex);
      }
    });
  }

  private _createSlideControls(section: HTMLElement, sectionIndex: number): void {
    const fragment = document.createDocumentFragment();

    const createBtn = (dir: 'prev' | 'next', icon: string, action: () => void) => {
      const btn = document.createElement('button');
      btn.className = `sp-control-arrow sp-${dir}`;
      btn.innerHTML = icon;
      btn.setAttribute('aria-label', `${dir} slide`);
      btn.onclick = (e) => { e.stopPropagation(); action(); };
      return btn;
    };

    fragment.appendChild(createBtn('prev', '&#10094;', () => this.moveSlideLeft(sectionIndex)));
    fragment.appendChild(createBtn('next', '&#10095;', () => this.moveSlideRight(sectionIndex)));
    section.appendChild(fragment);
  }

  /** UI Component: Side Navigation */
  private _createNavigation(): void {
    const nav = document.createElement('nav');
    nav.className = 'sp-nav';
    nav.setAttribute('role', 'navigation');

    const ul = document.createElement('ul');
    this.sections.forEach((_, i) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#section-${i}`;
      a.onclick = (e) => { e.preventDefault(); this.moveTo(i); };
      li.appendChild(a);
      ul.appendChild(li);
      this.navLinks.push(a);
    });

    nav.appendChild(ul);
    document.body.appendChild(nav);
  }

  /** Event Management */
  private _bindEvents(): void {
    const wheelHandler = (e: WheelEvent) => this._handleWheel(e);
    const keyHandler = (e: KeyboardEvent) => this._handleKeydown(e);
    const touchStartHandler = (e: TouchEvent) => {
      this.touchStart.x = e.touches[0].clientX;
      this.touchStart.y = e.touches[0].clientY;
    };
    const touchMoveHandler = (e: TouchEvent) => this._handleTouchMove(e);

    window.addEventListener('wheel', wheelHandler, { passive: false });
    window.addEventListener('keydown', keyHandler);
    window.addEventListener('touchstart', touchStartHandler, { passive: true });
    window.addEventListener('touchmove', touchMoveHandler, { passive: false });

    // Handle Resize (Responsive positioning)
    window.addEventListener('resize', () => this._syncPositions());
  }

  private _handleWheel(e: WheelEvent): void {
    e.preventDefault();
    if (this.isScrolling) return;

    // Use absolute delta to detect primary scroll direction
    const { deltaX, deltaY } = e;
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > 0) this.next();
      else this.prev();
    } else {
      if (deltaX > 0) this.moveSlideRight(this.currentIndex);
      else this.moveSlideLeft(this.currentIndex);
    }
  }

  private _handleKeydown(e: KeyboardEvent): void {
    if (this.isScrolling) return;
    const actions: Record<string, () => void> = {
      ArrowDown: () => this.next(),
      ArrowUp: () => this.prev(),
      ArrowRight: () => this.moveSlideRight(this.currentIndex),
      ArrowLeft: () => this.moveSlideLeft(this.currentIndex)
    };
    if (actions[e.key]) actions[e.key]();
  }

  private _handleTouchMove(e: TouchEvent): void {
    if (this.isScrolling) return;
    const dx = this.touchStart.x - e.touches[0].clientX;
    const dy = this.touchStart.y - e.touches[0].clientY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 50) {
        if (dx > 0) this.moveSlideRight(this.currentIndex);
        else this.moveSlideLeft(this.currentIndex);
      }
    } else {
      if (Math.abs(dy) > 50) {
        if (dy > 0) this.next();
        else this.prev();
      }
    }
  }

  /** Public API: Orchestration */
  public setOptions(newOptions: SmoothPageOptions): void {
    this.options = { ...this.options, ...newOptions };

    // UI Update (Animations)
    const anims = ['sp-animation-default', 'sp-animation-zoom', 'sp-animation-slide-up', 'sp-animation-parallax'];
    this.container.classList.remove(...anims);
    this.container.classList.add(`sp-animation-${this.options.animation}`);

    this._syncPositions();
    this._applyStyles();
  }

  private _syncPositions(): void {
    const isSpecialAnim = ['slide-up', 'zoom'].includes(this.options.animation);

    // Update Vertical Position
    this.container.style.transform = isSpecialAnim ? 'none' : `translateY(-${this.currentIndex * 100}%)`;

    // Update Horizontal Slide Positions
    this.slidesData.forEach(data => {
      if (data.container) {
        data.container.style.transform = `translateX(-${data.currentIndex * 100}%)`;
      }
    });
  }

  private _applyStyles(): void {
    const { scrollingSpeed: speed, easing } = this.options;
    const transition = `transform ${speed}ms ${easing}`;

    this.container.style.transition = transition;
    this.sections.forEach(section => {
      section.style.transition = `all ${speed}ms ${easing}`;
      const slides = section.querySelector<HTMLElement>('.sp-slides');
      if (slides) slides.style.transition = transition;
    });
  }

  /** Navigation Logic */
  public moveTo(index: number): void {
    if (index < 0 || index >= this.totalSections || (index === this.currentIndex && !this.isScrolling)) return;

    this.isScrolling = true;
    const prevIndex = this.currentIndex;
    this.currentIndex = index;

    this.options.onLeave(prevIndex, index);
    this._updateActiveState();

    if (!['slide-up', 'zoom'].includes(this.options.animation)) {
      this.container.style.transform = `translateY(-${index * 100}%)`;
    }

    // Precise transition completion via event or fallback timer
    this._onTransitionEnd(this.container, () => {
      this.isScrolling = false;
      this.options.afterLoad(index);
    });
  }

  public moveToSlide(sectionIndex: number, slideIndex: number): void {
    const data = this.slidesData[sectionIndex];
    if (!data || !data.container || slideIndex < 0 || slideIndex >= data.items.length || slideIndex === data.currentIndex) return;

    this.isScrolling = true;
    const prevSlideIndex = data.currentIndex;
    data.currentIndex = slideIndex;

    this.options.onSlideLeave(sectionIndex, prevSlideIndex, slideIndex);
    this._updateActiveState();

    data.container.style.transform = `translateX(-${slideIndex * 100}%)`;

    this._onTransitionEnd(data.container, () => {
      this.isScrolling = false;
      this.options.afterSlideLoad(sectionIndex, slideIndex);
    });
  }

  private _onTransitionEnd(el: HTMLElement, callback: () => void): void {
    let fired = false;
    const handler = () => {
      if (!fired) {
        fired = true;
        el.removeEventListener('transitionend', handler);
        callback();
      }
    };
    el.addEventListener('transitionend', handler);
    // Safety fallback
    setTimeout(handler, this.options.scrollingSpeed + 50);
  }

  public moveSlideRight(idx: number): void {
    const d = this.slidesData[idx];
    if (d && d.currentIndex < d.items.length - 1) this.moveToSlide(idx, d.currentIndex + 1);
  }

  public moveSlideLeft(idx: number): void {
    const d = this.slidesData[idx];
    if (d && d.currentIndex > 0) this.moveToSlide(idx, d.currentIndex - 1);
  }

  public next(): void { this.moveTo(this.currentIndex + 1); }
  public prev(): void { this.moveTo(this.currentIndex - 1); }

  private _updateActiveState(): void {
    this.sections.forEach((section, i) => {
      const isActiveSection = i === this.currentIndex;

      section.classList.toggle('active', isActiveSection);
      section.classList.toggle('sp-past', i < this.currentIndex);
      section.classList.toggle('sp-future', i > this.currentIndex);

      const data = this.slidesData[i];
      if (data && data.items.length > 0) {
        data.items.forEach((slide, si) => {
          slide.classList.toggle('active', isActiveSection && si === data.currentIndex);
        });
      }
    });

    this.navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === this.currentIndex);
    });
  }
}

// Browser Global Support
if (typeof window !== 'undefined') {
  (window as any).SmoothPage = SmoothPage;
}

export default SmoothPage;
