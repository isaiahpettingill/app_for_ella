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
import ellaIconSrc from '../../assets/unicorn.png'; // Import the image
import beeIconSrc from '../../assets/bee_app.png'; // Import the image
import weatherIconSrc from '../../assets/weather.png'; // Import the image
import mailIconSrc from '../../assets/mail.png'; // Import the image
import duckNotesIconSrc from '../../assets/duck_notes.png'; // Import the Notes app icon
// App definition type for better type safety
type AppIconType = 'image' | 'heroicon' | 'invisible';
interface AppDefinition {
    name: string;
    link: string;
    icon: ComponentType<any> | string;
    iconType?: AppIconType;
    isSpecial?: boolean;
}

const apps: AppDefinition[] = [
    { name: 'Photos', icon: PhotoIcon, iconType: 'heroicon', link: '#' },
    { name: 'Mail', icon: mailIconSrc, iconType: 'image', link: '/mail' },
    { name: "Ella's App", icon: ellaIconSrc, iconType: 'image', link: '/', isSpecial: true },
    { name: 'Settings', icon: Cog6ToothIcon, iconType: 'heroicon', link: '#' },
    { name: 'James Fitness', icon: pushupIconSrc, iconType: 'image', link: '/James' },
    { name: 'Bee', icon: beeIconSrc, iconType: 'image', link: '/bees' },
    { name: 'Weather', icon: weatherIconSrc, iconType: 'image', link: '/weather' },
    { name: 'Maps', icon: HeroMapIcon, iconType: 'heroicon', link: 'https://maps.google.com' },
    { name: '', icon: () => <></>, iconType: 'invisible', link: '#' },
    { name: 'Calendar', icon: CalendarIcon, iconType: 'heroicon', link: '#' },
    { name: 'Notes', icon: duckNotesIconSrc, iconType: 'image', link: '/notes' },
];


const APPS_PER_PAGE = 9;
const SWIPE_PAGE_THRESHOLD = 12;

function chunkApps(apps, size) {
    const pages = [];
    for (let i = 0; i < apps.length; i += size) {
        pages.push(apps.slice(i, i + size));
    }
    return pages;
}

export const MobileOS = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const swipeableContentRef = useRef<HTMLDivElement>(null);
    const [isSwiping, setIsSwiping] = useState(false);
    const [startPointer, setStartPointer] = useState({ x: 0, y: 0 });
    const [currentPage, setCurrentPage] = useState(0);
    const [dragOffset, setDragOffset] = useState(0); // For smooth drag effect
    const [animating, setAnimating] = useState(false);

    // If the number of apps is a multiple of APPS_PER_PAGE, add a null to force a new page
    let appsForPaging = [...apps];
    if (apps.length % APPS_PER_PAGE === 0) {
        appsForPaging.push(null);
    }
    const appPages = chunkApps(appsForPaging, APPS_PER_PAGE);
    const totalPages = appPages.length;

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
        return () => clearInterval(timerId);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const handleNavClick = (e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>, to: string) => {
        e.preventDefault();
        route(to);
    };

    // Only allow horizontal swiping for paging
    const handlePointerDown = (e: PointerEvent) => {
        if (swipeableContentRef.current && (e.target === swipeableContentRef.current || swipeableContentRef.current.contains(e.target as Node))) {
            setIsSwiping(true);
            setStartPointer({ x: e.clientX, y: e.clientY });
            if (swipeableContentRef.current) {
                swipeableContentRef.current.style.transition = 'none';
            }
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            swipeableContentRef.current.style.cursor = 'grabbing';
        }
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!isSwiping || !swipeableContentRef.current) return;
        let deltaX = e.clientX - startPointer.x;
        setDragOffset(deltaX);
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (!swipeableContentRef.current) return;
        swipeableContentRef.current.style.cursor = 'grab';
        let deltaX = dragOffset;
        let newPage = currentPage;
        if (deltaX < -SWIPE_PAGE_THRESHOLD && currentPage < totalPages - 1) {
            newPage = currentPage + 1;
        } else if (deltaX > SWIPE_PAGE_THRESHOLD && currentPage > 0) {
            newPage = currentPage - 1;
        }
        setIsSwiping(false);
        setAnimating(true);
        setCurrentPage(newPage);
        setDragOffset(0);
        if ((e.target as HTMLElement).hasPointerCapture?.(e.pointerId)) {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        }
    };

    // Animate transform smoothly when not dragging
    useEffect(() => {
        const el = swipeableContentRef.current;
        const currentDocument = document;
        if (!el) return;
        // Pointer event listeners
        el.style.cursor = 'grab';
        el.addEventListener('pointerdown', handlePointerDown as EventListener);
        currentDocument.addEventListener('pointermove', handlePointerMove as EventListener);
        currentDocument.addEventListener('pointerup', handlePointerUp as EventListener);
        currentDocument.addEventListener('pointercancel', handlePointerUp as EventListener);
        return () => {
            el.removeEventListener('pointerdown', handlePointerDown as EventListener);
            currentDocument.removeEventListener('pointermove', handlePointerMove as EventListener);
            currentDocument.removeEventListener('pointerup', handlePointerUp as EventListener);
            currentDocument.removeEventListener('pointercancel', handlePointerUp as EventListener);
        };
    }, [isSwiping, dragOffset, currentPage]);

    // Remove animation class after transition
    useEffect(() => {
        if (!animating) return;
        const el = swipeableContentRef.current;
        if (!el) return;
        const handleTransitionEnd = () => setAnimating(false);
        el.addEventListener('transitionend', handleTransitionEnd);
        return () => el.removeEventListener('transitionend', handleTransitionEnd);
    }, [animating]);

    // Render two pages: current and next/prev for smooth swipe
    const getPageApps = (pageIdx: number) => {
        const currentApps = appPages[pageIdx] || [];
        const paddedApps = [...currentApps];
        while (paddedApps.length < APPS_PER_PAGE) {
            paddedApps.push(null);
        }
        return paddedApps;
    };

    const pagesToRender = [];
    if (currentPage > 0) {
        pagesToRender.push(getPageApps(currentPage - 1));
    }
    pagesToRender.push(getPageApps(currentPage));
    if (currentPage < totalPages - 1) {
        pagesToRender.push(getPageApps(currentPage + 1));
    }

    // Figure out which index in pagesToRender is the current page
    const renderIndex = currentPage > 0 ? 1 : 0;

    // Calculate transform
    const baseTranslate = -renderIndex * 100;
    const dragTranslate = (dragOffset / window.innerWidth) * 100;
    const totalTranslate = baseTranslate + dragTranslate;

    return (
        <div className={styles.container} style={{ overflow: 'hidden', touchAction: 'pan-y' }}>
            {/* Top Bar: Time and Battery */}
            <div className={styles.topBar}>
                <div className={styles.time}>{formattedTime}</div>
                <div className={styles.batteryStatus}>
                    <span>100%</span> <Battery100Icon className={styles.batteryIcon} />
                </div>
            </div>

            {/* Swipeable Content Area */}
            <div className={styles.swipeableArea} style={{ overflow: 'hidden', height: '100%' }}>
                {/* App Grid Pager */}
                <div
                    ref={swipeableContentRef}
                    className={styles.appGridPager}
                    style={{
                        display: 'flex',
                        width: `${pagesToRender.length * 100}vw`,
                        transform: `translateX(${totalTranslate}vw)`,
                        transition: isSwiping ? 'none' : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                        pointerEvents: isSwiping ? 'auto' : 'auto',
                        height: '100%',
                    }}
                >
                    {pagesToRender.map((paddedApps, pageIdx) => (
                        <div key={pageIdx} className={styles.appGrid} style={{ width: '100vw', height: '100%' }}>
                            {paddedApps.map((app, index) => {
                                if (!app || app.iconType === 'invisible') {
                                    // Invisible slot for grid
                                    return <div key={index} className={styles.appIcon} style={{ opacity: 0, pointerEvents: 'none' }} />;
                                }
                                const commonOuterClass = styles.appIcon;
                                const IconToRender = app.icon;
                                const content = (
                                    <Fragment>
                                        {app.iconType === 'image' && typeof IconToRender === 'string' ? (
                                            <img
                                                src={IconToRender}
                                                alt={app.name}
                                                className={styles.appImage}
                                            />
                                        ) : typeof IconToRender === 'function' ? (
                                            <div className={`${styles.appImageContainer} ${app.isSpecial ? styles.homeAppIconBackground : ''}`}>
                                                <IconToRender className={styles.heroIcon} />
                                            </div>
                                        ) : null}
                                        <span>{app.name}</span>
                                    </Fragment>
                                );
                                if (app.link.startsWith('/')) {
                                    return <a key={index} href={app.link} className={commonOuterClass} onClick={(e) => handleNavClick(e, app.link)}>{content}</a>;
                                } else {
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
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className={styles.navBar}>
                <button className={styles.navButton} aria-label="Back" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                    {/* ArrowUturnLeftIcon */}
                </button>
                <button className={styles.navButton} aria-label="Home screen">
                    {/* HeroHomeIcon */}
                </button>
                <button className={styles.navButton} aria-label="Open apps" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>
                    {/* Squares2X2Icon */}
                </button>
            </div>
        </div>
    );
}; 