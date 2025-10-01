import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

interface WorkoutDetectorProps {
  workoutType: string;
  targetCount: number;
  onProgress: (count: number) => void;
  onComplete: () => void;
  isActive: boolean;
}

export function useWorkoutDetector({
  workoutType,
  targetCount,
  onProgress,
  onComplete,
  isActive,
}: WorkoutDetectorProps) {
  const [currentCount, setCurrentCount] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const lastMovementTime = useRef(Date.now());
  const movementBuffer = useRef<number[]>([]);
  const isMoving = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    // Set update interval based on workout type
    const updateInterval = getUpdateInterval(workoutType);
    Accelerometer.setUpdateInterval(updateInterval);

    const subscription = Accelerometer.addListener((data) => {
      setAccelerometerData(data);
      detectMovement(data);
    });

    return () => {
      subscription.remove();
    };
  }, [isActive, workoutType, currentCount]);

  useEffect(() => {
    if (currentCount >= targetCount && isActive) {
      onComplete();
    }
  }, [currentCount, targetCount, isActive]);

  const getUpdateInterval = (type: string): number => {
    // Different workout types need different detection frequencies
    switch (type) {
      case 'jumping-jacks':
      case 'burpees':
        return 100; // Fast movements
      case 'push-ups':
      case 'sit-ups':
      case 'squats':
        return 150; // Medium movements
      case 'plank':
        return 500; // Slow/static
      default:
        return 100;
    }
  };

  const getThreshold = (type: string): number => {
    // Different thresholds for different workout types
    switch (type) {
      case 'jumping-jacks':
        return 1.8; // High movement
      case 'burpees':
        return 2.0; // Very high movement
      case 'push-ups':
        return 1.5; // Moderate movement
      case 'sit-ups':
        return 1.4; // Moderate movement
      case 'squats':
        return 1.6; // Moderate-high movement
      case 'mountain-climbers':
        return 1.7; // High movement
      default:
        return 1.5;
    }
  };

  const detectMovement = (data: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );
    const threshold = getThreshold(workoutType);
    const now = Date.now();

    // Add to movement buffer for smoothing
    movementBuffer.current.push(magnitude);
    if (movementBuffer.current.length > 5) {
      movementBuffer.current.shift();
    }

    // Calculate average magnitude to reduce false positives
    const avgMagnitude =
      movementBuffer.current.reduce((a, b) => a + b, 0) /
      movementBuffer.current.length;

    // Detect movement peak
    if (avgMagnitude > threshold && !isMoving.current) {
      isMoving.current = true;

      // Debounce to avoid double-counting (minimum 500ms between reps)
      if (now - lastMovementTime.current > 500) {
        incrementCount();
        lastMovementTime.current = now;
      }
    } else if (avgMagnitude < threshold * 0.7) {
      // Reset moving state when movement settles
      isMoving.current = false;
    }
  };

  const incrementCount = () => {
    const newCount = currentCount + 1;
    setCurrentCount(newCount);
    onProgress(newCount);

    // Haptic feedback for each rep
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const reset = () => {
    setCurrentCount(0);
    movementBuffer.current = [];
    isMoving.current = false;
  };

  return {
    currentCount,
    accelerometerData,
    reset,
  };
}

export default useWorkoutDetector;
