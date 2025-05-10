import { h, Fragment, ComponentType } from 'preact';
import { route } from 'preact-router';
import { useEffect, useState, useRef } from 'preact/hooks';
import styles from './MobileOS.module.css'; // Import CSS Modules
import {
  Battery100Icon 
} from '@heroicons/react/24/outline';

import {
  PhotoIcon,
  EnvelopeIcon,
  CalendarIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  CloudIcon,
  MapIcon as HeroMapIcon, // Renamed to avoid conflict if we use a generic MapIcon name
  StarIcon // Import StarIcon
} from '@heroicons/react/24/solid';

import pushupIconSrc from '../../assets/pushup.png'; // Import the image

// Placeholder icons - you can replace these with actual SVGs or icon components
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const AppsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
const BatteryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>;


const appIconPlaceholder = "https://via.placeholder.com/64?text=App";

// App definition type for better type safety
interface AppDefinition {
  name: string;
  link: string;
  icon: ComponentType<any> | string; // Using ComponentType<any> for Heroicons for broader compatibility
  iconType?: 'image' | 'heroicon';
  isSpecial?: boolean; // Flag for special styling like pink background
}

const apps: AppDefinition[] = [
  { name: 'Photos', icon: PhotoIcon, iconType: 'heroicon', link: '#' },
  { name: 'Mail', icon: EnvelopeIcon, iconType: 'heroicon', link: '#' },
  { name: 'Calendar', icon: CalendarIcon, iconType: 'heroicon', link: '#' },
  { name: "Ella's App", icon: StarIcon, iconType: 'heroicon', link: '/', isSpecial: true }, // Use StarIcon and flag for special style
  { name: 'Settings', icon: Cog6ToothIcon, iconType: 'heroicon', link: '#' },
  { name: 'James Fitness', icon: pushupIconSrc, iconType: 'image', link: '/James' },
  { name: 'Weather', icon: CloudIcon, iconType: 'heroicon', link: '/weather' },
  { name: 'Maps', icon: HeroMapIcon, iconType: 'heroicon', link: 'https://maps.google.com' },
  { name: 'Bee', icon: () => <span style={{fontSize: '2em'}} role="img" aria-label="bee">🐝</span>, iconType: 'heroicon', link: '/bees' },
];

const SWIPE_RESISTANCE = 3;
const MAX_OFFSET = 60; // Adjusted max offset for both directions
const PULL_RESISTANCE_FACTOR = 0.4;

export const MobileOS = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const swipeableContentRef = useRef<HTMLDivElement>(null); // Renamed for clarity
  const [isSwiping, setIsSwiping] = useState(false);
  const [startPointer, setStartPointer] = useState({ x: 0, y: 0 });
  // const [offset, setOffset] = useState({ x: 0, y: 0 }); // Not strictly needed if only applying transform

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timerId);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleNavClick = (e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    route(to);
  };

  const handlePointerDown = (e: PointerEvent) => {
    // Target should be the swipeableContentRef or its direct child (appGrid)
    if (swipeableContentRef.current && (e.target === swipeableContentRef.current || swipeableContentRef.current.contains(e.target as Node))) {
      setIsSwiping(true);
      setStartPointer({ x: e.clientX, y: e.clientY });
      if (swipeableContentRef.current) swipeableContentRef.current.style.transition = 'none';
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      swipeableContentRef.current.style.cursor = 'grabbing';
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isSwiping || !swipeableContentRef.current) return;
    
    let deltaX = e.clientX - startPointer.x;
    let deltaY = e.clientY - startPointer.y;

    let offsetX = deltaX / SWIPE_RESISTANCE;
    let offsetY = deltaY / SWIPE_RESISTANCE;

    // Apply pull resistance beyond MAX_OFFSET
    if (Math.abs(offsetX) > MAX_OFFSET) {
      const overScrollX = Math.abs(offsetX) - MAX_OFFSET;
      offsetX = (offsetX > 0 ? MAX_OFFSET : -MAX_OFFSET) + (offsetX > 0 ? 1 : -1) * (overScrollX * PULL_RESISTANCE_FACTOR);
    }
    if (Math.abs(offsetY) > MAX_OFFSET) {
      const overScrollY = Math.abs(offsetY) - MAX_OFFSET;
      offsetY = (offsetY > 0 ? MAX_OFFSET : -MAX_OFFSET) + (offsetY > 0 ? 1 : -1) * (overScrollY * PULL_RESISTANCE_FACTOR);
    }
    
    // Cap the maximum pull to avoid extreme movement
    const maxPull = MAX_OFFSET * 1.5; // Allow pulling a bit further than MAX_OFFSET
    if (Math.abs(offsetX) > maxPull) offsetX = offsetX > 0 ? maxPull : -maxPull;
    if (Math.abs(offsetY) > maxPull) offsetY = offsetY > 0 ? maxPull : -maxPull;

    swipeableContentRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!swipeableContentRef.current) return;
    
    swipeableContentRef.current.style.cursor = 'grab';
    if (!isSwiping && swipeableContentRef.current.style.transform === 'translate(0px, 0px)') return;
    
    setIsSwiping(false);
    swipeableContentRef.current.style.transition = 'transform 0.3s ease-out';
    swipeableContentRef.current.style.transform = 'translate(0px, 0px)';
    
    if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  useEffect(() => {
    const el = swipeableContentRef.current;
    const currentDocument = document; // Cache document for removal
    if (el) {
      // el is the swipeableContent itself, which contains the appGrid.
      // We want the rubber band effect on the appGrid if it overflows swipeableArea, 
      // but swipeableArea is already set to overflow:hidden.
      // So the transform should be on the appGrid itself (the direct child of swipeableArea)
      // Let's assume swipeableContentRef is now on the appGrid and swipeableArea is the parent.

      // Pointer events should be on the element that moves (appGrid)
      el.style.cursor = 'grab';
      el.addEventListener('pointerdown', handlePointerDown as EventListener);
      // Move and Up listeners should be on document to catch events outside the element
      currentDocument.addEventListener('pointermove', handlePointerMove as EventListener);
      currentDocument.addEventListener('pointerup', handlePointerUp as EventListener);
      currentDocument.addEventListener('pointercancel', handlePointerUp as EventListener);
      return () => {
        el.removeEventListener('pointerdown', handlePointerDown as EventListener);
        currentDocument.removeEventListener('pointermove', handlePointerMove as EventListener);
        currentDocument.removeEventListener('pointerup', handlePointerUp as EventListener);
        currentDocument.removeEventListener('pointercancel', handlePointerUp as EventListener);
      };
    }
  }, [isSwiping]); // Removed startPointer from deps, it's captured in handlePointerDown closure

  return (
    <div className={styles.container}>
      {/* Top Bar: Time and Battery */}
      <div className={styles.topBar}>
        <div className={styles.time}>{formattedTime}</div>
        <div className={styles.batteryStatus}>
          <span>100%</span> <Battery100Icon className={styles.batteryIcon} /> 
        </div>
      </div>

      {/* Swipeable Content Area */}
      <div className={styles.swipeableArea}>
        {/* App Grid */}
        <div ref={swipeableContentRef} className={styles.appGrid}>
          {apps.map((app, index) => {
            const commonOuterClass = styles.appIcon;
            const IconToRender = app.icon;
            const content = (
              <Fragment>
                {app.iconType === 'image' && typeof IconToRender === 'string' ? (
                  <img 
                    src={IconToRender} 
                    alt={app.name} 
                    className={styles.appImage} // Pink background handled by appImageContainer for heroicons
                  />
                ) : typeof IconToRender === 'function' ? (
                  // Apply pink background if app.isSpecial is true
                  <div className={`${styles.appImageContainer} ${app.isSpecial ? styles.homeAppIconBackground : ''}`}>
                    <IconToRender className={styles.heroIcon} />
                  </div>
                ) : null}
                <span>{app.name}</span>
              </Fragment>
            );

            if (app.link.startsWith('/')) {
              return <a key={index} href={app.link} className={commonOuterClass} onClick={(e) => handleNavClick(e, app.link)}>{content}</a>;
            } else { // External link or placeholder
              return (
                <a 
                  key={index} 
                  href={app.link} 
                  className={commonOuterClass} 
                  onClick={(e) => { if (app.link === '#') e.preventDefault(); }}
                  target={app.link.startsWith('http') ? '_blank' : undefined}
                  rel={app.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </a>
              );
            }
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={styles.navBar}>
        <button className={styles.navButton} aria-label="Back">
          {/* ArrowUturnLeftIcon */}
        </button>
        <button className={styles.navButton} aria-label="Home screen">
          {/* HeroHomeIcon */}
        </button>
        <button className={styles.navButton} aria-label="Open apps">
          {/* Squares2X2Icon */}
        </button>
      </div>
    </div>
  );
}; 