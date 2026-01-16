'use client';

import React from 'react';

const FlowingLiquid = () => {
  // Slightly darker than background (#ebddd0) - subtle contrast
  const liquidColor = '#d0c0a8'; // Between milk-tea-medium and the darker version
  
  // Each segment is exactly 1200 units wide and starts/ends at same Y for seamless tiling.
  const wave1Segment =
    'M0,100 Q150,40 300,70 Q450,100 600,85 Q750,70 900,90 Q1050,110 1200,100';
  const wave2Segment =
    'M0,120 Q200,70 400,100 Q600,130 800,110 Q1000,90 1200,120';
  const wave3Segment =
    'M0,130 Q250,90 500,115 Q750,140 1000,120 Q1125,100 1200,130';

  const closeToBottom = ' L1200,200 L0,200 Z';

  const WaveSvg = ({
    fill,
    d,
    opacity,
    gradientId,
    gradientStops,
  }: {
    fill: string;
    d: string;
    opacity?: number;
    gradientId?: string;
    gradientStops?: { top: number; bottom: number };
  }) => (
    <svg
      className="h-full shrink-0"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      style={{ display: 'block', width: '100vw' }}
    >
      {gradientId && gradientStops ? (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={liquidColor} stopOpacity={gradientStops.top} />
            <stop offset="100%" stopColor={liquidColor} stopOpacity={gradientStops.bottom} />
          </linearGradient>
        </defs>
      ) : null}
      <path fill={fill} fillOpacity={opacity} d={`${d}${closeToBottom}`} />
    </svg>
  );

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, height: '180px' }}
    >
      {/* Layer 1: leftward flow */}
      <div className="wave-track wave-track--left absolute inset-y-0 left-0">
        <WaveSvg
          fill="url(#liquidGradient1)"
          d={wave1Segment}
          gradientId="liquidGradient1"
          gradientStops={{ top: 0.7, bottom: 1 }}
        />
        <WaveSvg
          fill="url(#liquidGradient1)"
          d={wave1Segment}
          gradientId="liquidGradient1"
          gradientStops={{ top: 0.7, bottom: 1 }}
        />
      </div>

      {/* Layer 2: rightward flow (subtle complexity) */}
      <div
        className="wave-track wave-track--right absolute inset-y-0 left-0"
        style={{ animationDelay: '2s' }}
      >
        <WaveSvg
          fill="url(#liquidGradient2)"
          d={wave2Segment}
          gradientId="liquidGradient2"
          gradientStops={{ top: 0.5, bottom: 0.9 }}
        />
        <WaveSvg
          fill="url(#liquidGradient2)"
          d={wave2Segment}
          gradientId="liquidGradient2"
          gradientStops={{ top: 0.5, bottom: 0.9 }}
        />
      </div>

      {/* Layer 3: leftward flow, softer */}
      <div
        className="wave-track wave-track--left absolute inset-y-0 left-0"
        style={{ animationDelay: '5s', opacity: 0.6 }}
      >
        <WaveSvg fill={liquidColor} d={wave3Segment} opacity={0.4} />
        <WaveSvg fill={liquidColor} d={wave3Segment} opacity={0.4} />
      </div>
    </div>
  );
};

export default FlowingLiquid;

