'use client';

export default function FlowingFooter() {
  return (
    <footer className="relative w-full mt-auto overflow-hidden">
      <div className="relative w-full h-24 overflow-hidden">
        {/* First wave layer - more erratic */}
        <div className="absolute bottom-0 w-full h-full liquid-wave-container">
          <svg
            className="liquid-wave-svg"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '200%', height: '100%' }}
          >
            <defs>
              <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#d4c4b0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#c9b8a0" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <path
              d="M0,70 C180,30 360,100 540,50 C720,20 900,110 1080,60 C1200,40 1320,90 1440,70 L1440,120 L0,120 Z"
              fill="url(#liquidGradient)"
            />
            <path
              d="M1440,70 C1620,30 1800,100 1980,50 C2160,20 2340,110 2520,60 C2640,40 2760,90 2880,70 L2880,120 L1440,120 Z"
              fill="url(#liquidGradient)"
            />
          </svg>
        </div>
        
        {/* Second wave layer - different erratic pattern */}
        <div className="absolute bottom-0 w-full h-full liquid-wave-container-2" style={{ opacity: 0.65 }}>
          <svg
            className="liquid-wave-svg-2"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '200%', height: '100%' }}
          >
            <path
              d="M0,90 C240,40 480,110 720,70 C900,50 1080,100 1320,80 C1380,75 1440,85 1440,85 L1440,120 L0,120 Z"
              fill="#d4c4b0"
              fillOpacity="0.4"
            />
            <path
              d="M1440,90 C1680,40 1920,110 2160,70 C2340,50 2520,100 2760,80 C2820,75 2880,85 2880,85 L2880,120 L1440,120 Z"
              fill="#d4c4b0"
              fillOpacity="0.4"
            />
          </svg>
        </div>
        
        {/* Third wave layer - very erratic */}
        <div className="absolute bottom-0 w-full h-full liquid-wave-container-3" style={{ opacity: 0.4 }}>
          <svg
            className="liquid-wave-svg-3"
            viewBox="0 0 2880 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '200%', height: '100%' }}
          >
            <path
              d="M0,60 C120,100 300,35 480,85 C660,120 840,30 1020,75 C1140,105 1260,45 1440,65 L1440,120 L0,120 Z"
              fill="#c9b8a0"
              fillOpacity="0.3"
            />
            <path
              d="M1440,60 C1560,100 1740,35 1920,85 C2100,120 2280,30 2460,75 C2580,105 2700,45 2880,65 L2880,120 L1440,120 Z"
              fill="#c9b8a0"
              fillOpacity="0.3"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}
