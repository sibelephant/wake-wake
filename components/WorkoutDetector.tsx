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
    // Faster polling for more responsive detection
    return 50; // Increased from 100ms to catch steps more quickly
  };

  const getThreshold = (type: string): number => {
    // Lower threshold for more sensitive step detection
    return 1.1; // Reduced from 1.3 to detect lighter steps
  };

  const detectMovement = (data: { x: number; y: number; z: number }) => {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z
    );
    const threshold = getThreshold(workoutType);
    const now = Date.now();

    // Smaller buffer for faster response
    movementBuffer.current.push(magnitude);
    if (movementBuffer.current.length > 3) { // Reduced from 5 to 3
      movementBuffer.current.shift();
    }

    // Calculate average magnitude to reduce false positives
    const avgMagnitude =
      movementBuffer.current.reduce((a, b) => a + b, 0) /
      movementBuffer.current.length;

    // Detect movement peak
    if (avgMagnitude > threshold && !isMoving.current) {
      isMoving.current = true;

      // Reduced debounce time for faster detection
      if (now - lastMovementTime.current > 350) { // Reduced from 500ms to 350ms
        incrementCount();
        lastMovementTime.current = now;
      }
    } else if (avgMagnitude < threshold * 0.8) { // Adjusted from 0.7 to 0.8
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