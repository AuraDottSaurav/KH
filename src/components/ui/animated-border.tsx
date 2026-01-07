'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface AnimatedBorderProps {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    duration?: number;
}

export function AnimatedBorder({
    children,
    className,
    containerClassName,
    duration = 4,
}: AnimatedBorderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const rx = dimensions.height / 2;
    const perimeter = dimensions.width && dimensions.height
        ? 2 * (dimensions.width - dimensions.height) + Math.PI * dimensions.height
        : 0;

    // Create gradient steps - uniform width stroke with color gradient
    const gradientSteps = [
        { offset: 0.00, color: 'rgba(99, 102, 241, 0.0)', length: 0.12 },
        { offset: 0.01, color: 'rgba(99, 102, 241, 0.2)', length: 0.12 },
        { offset: 0.02, color: 'rgba(124, 93, 250, 0.4)', length: 0.12 },
        { offset: 0.03, color: 'rgba(139, 92, 246, 0.5)', length: 0.12 },
        { offset: 0.04, color: 'rgba(168, 85, 247, 0.6)', length: 0.12 },
        { offset: 0.05, color: 'rgba(192, 132, 252, 0.7)', length: 0.12 },
        { offset: 0.06, color: 'rgba(216, 180, 254, 0.8)', length: 0.12 },
        { offset: 0.07, color: 'rgba(243, 232, 255, 0.9)', length: 0.12 },
        { offset: 0.08, color: 'rgba(255, 255, 255, 0.95)', length: 0.12 },
        { offset: 0.09, color: 'rgba(255, 255, 255, 0.5)', length: 0.12 },
    ];

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative rounded-full",
                containerClassName
            )}
        >
            {perimeter > 0 && (
                <svg
                    className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] pointer-events-none"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Static base border */}
                    <rect
                        x="0.5"
                        y="0.5"
                        width={dimensions.width + 1}
                        height={dimensions.height + 1}
                        rx={rx + 0.5}
                        ry={rx + 0.5}
                        fill="none"
                        stroke="rgba(63, 63, 70, 0.5)"
                        strokeWidth="1"
                    />

                    {/* Gradient blend layers - many thin strokes for smooth gradient */}
                    {gradientSteps.map((step, i) => (
                        <rect
                            key={i}
                            x="0.5"
                            y="0.5"
                            width={dimensions.width + 1}
                            height={dimensions.height + 1}
                            rx={rx + 0.5}
                            ry={rx + 0.5}
                            fill="none"
                            stroke={step.color}
                            strokeWidth={0.1}
                            strokeLinecap="round"
                            filter="url(#glow)"
                            style={{
                                strokeDasharray: `${perimeter * step.length} ${perimeter * (1 - step.length)}`,
                                strokeDashoffset: perimeter * step.offset,
                                animation: `borderStrokeRotate ${duration}s linear infinite`,
                            }}
                        />
                    ))}
                </svg>
            )}

            {/* Inner content */}
            <div
                className={cn(
                    "relative rounded-full bg-zinc-900/80 backdrop-blur-md border border-transparent",
                    className
                )}
            >
                {children}
            </div>

            <style jsx>{`
                @keyframes borderStrokeRotate {
                    from {
                        stroke-dashoffset: 0;
                    }
                    to {
                        stroke-dashoffset: -${perimeter};
                    }
                }
            `}</style>
        </div>
    );
}
