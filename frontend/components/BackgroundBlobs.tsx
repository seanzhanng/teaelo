'use client';

import React from 'react';

export default function BackgroundBlobs() {
  // Generate random irregular shapes for background with animation delays
  const backgroundShapes = [
    { top: '15%', left: '10%', width: '400px', height: '350px', clipPath: 'polygon(20% 0%, 80% 0%, 100% 40%, 85% 70%, 50% 100%, 15% 80%, 0% 50%)', opacity: 0.3, morphDelay: '0s', floatDelay: '0s', morphAnimation: 'blobMorph1' },
    { top: '60%', left: '5%', width: '350px', height: '400px', clipPath: 'polygon(30% 10%, 90% 5%, 100% 50%, 75% 95%, 25% 100%, 0% 60%, 5% 30%)', opacity: 0.25, morphDelay: '2s', floatDelay: '1s', morphAnimation: 'blobMorph2' },
    { top: '25%', left: '70%', width: '450px', height: '380px', clipPath: 'polygon(10% 15%, 85% 10%, 95% 45%, 80% 80%, 40% 95%, 5% 70%, 0% 35%)', opacity: 0.28, morphDelay: '4s', floatDelay: '2s', morphAnimation: 'blobMorph3' },
    { top: '70%', left: '75%', width: '380px', height: '420px', clipPath: 'polygon(25% 5%, 75% 0%, 100% 35%, 90% 75%, 60% 100%, 20% 90%, 0% 55%)', opacity: 0.22, morphDelay: '1s', floatDelay: '3s', morphAnimation: 'blobMorph4' },
    { top: '5%', left: '45%', width: '320px', height: '300px', clipPath: 'polygon(15% 20%, 80% 15%, 95% 50%, 70% 85%, 30% 90%, 5% 60%, 0% 30%)', opacity: 0.2, morphDelay: '3s', floatDelay: '1.5s', morphAnimation: 'blobMorph5' },
    { top: '45%', left: '25%', width: '360px', height: '340px', clipPath: 'polygon(20% 10%, 90% 5%, 100% 40%, 85% 75%, 45% 95%, 10% 80%, 0% 45%)', opacity: 0.26, morphDelay: '5s', floatDelay: '2.5s', morphAnimation: 'blobMorph6' },
    { top: '80%', left: '50%', width: '340px', height: '360px', clipPath: 'polygon(30% 0%, 70% 5%, 95% 40%, 80% 80%, 50% 100%, 15% 85%, 0% 50%)', opacity: 0.24, morphDelay: '1.5s', floatDelay: '4s', morphAnimation: 'blobMorph7' },
  ];

  return (
    <>
      {/* Random irregular shapes background */}
      {backgroundShapes.map((shape, index) => (
        <div
          key={index}
          className="fixed pointer-events-none z-0 blob-animation"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.width,
            height: shape.height,
            background: `radial-gradient(ellipse at center, rgba(180, 160, 140, ${shape.opacity}) 0%, rgba(180, 160, 140, ${shape.opacity * 0.6}) 50%, transparent 100%)`,
            filter: 'blur(80px)',
            animation: `${shape.morphAnimation} ${15 + index * 2}s cubic-bezier(0.4, 0, 0.2, 1) infinite ${shape.morphDelay}, blobFloat ${20 + index * 3}s ease-in-out infinite ${shape.floatDelay}`,
          }}
        />
      ))}
    </>
  );
}

