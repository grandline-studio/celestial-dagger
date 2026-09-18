import React, { useEffect, useState } from 'react';
import { animationController } from '../core/AnimationState';

interface ScreenShakeWrapperProps {
  children: React.ReactNode;
}

export const ScreenShakeWrapper: React.FC<ScreenShakeWrapperProps> = ({ children }) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    return animationController.subscribe((state) => {
      // Trigger shake when progress is between 0.970 and 0.992
      const inImpactWindow = state.progress >= 0.97 && state.progress <= 0.995;
      if (inImpactWindow && !state.reducedMotion) {
        setIsShaking(true);
      } else {
        setIsShaking(false);
      }
    });
  }, []);

  return (
    <div className={`relative w-full h-full ${isShaking ? 'shake-active' : ''}`}>
      {children}
    </div>
  );
};
