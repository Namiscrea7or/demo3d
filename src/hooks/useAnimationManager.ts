import { useState, useEffect } from 'react';
import { useSpring, easings } from '@react-spring/three';
import type { Phase } from '@/types';

export default function useAnimationManager(
  phases: Phase[],
  currentPhaseIndex: number,
  handleSubStepClick: (index: number) => void
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [spring, api] = useSpring(() => ({ subStepIndex: 0 }));

  useEffect(() => {
    const currentPhase = phases[currentPhaseIndex];
    if (isAnimating && currentPhase) {
      handleSubStepClick(0);
      
      api.start({
        from: { subStepIndex: 0 },
        to: { subStepIndex: currentPhase.subSteps.length - 1 },
        config: { duration: (currentPhase.subSteps.length - 1) * 1500, easing: easings.easeInOutCubic },
        onRest: () => {
          setIsAnimating(false);
          handleSubStepClick(currentPhase.subSteps.length - 1);
        },
      });
    }
  }, [isAnimating, phases, currentPhaseIndex, api, handleSubStepClick]);

  const handleOnPlay = () => {
    const currentPhase = phases[currentPhaseIndex];
    if (currentPhase && currentPhase.subSteps.length > 1 && !isAnimating) {
      setIsAnimating(true);
    }
  };

  return { isAnimating, spring, handleOnPlay };
}