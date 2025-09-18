import React, { useEffect, useRef, useState } from 'react';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';

interface WorkoutDetectorProps {
  workoutType: 'jumping-jacks' | 'push-ups' | 'sit-ups';
  onMovementDetected: () => void;
  isActive: boolean;
}

export const WorkoutDetector: React.FC<WorkoutDetectorProps> = ({
  workoutType,
  onMovementDetected,
  isActive,
}) => {
  const [data, setData] = useState<AccelerometerMeasurement>({ x: 0, y: 0, z: 0 });
  const lastDetectionTime = useRef(0);
  const movementBuffer = useRef<number[]>([]);

  useEffect(() => {
    let subscription: any;

    if (isActive) {
      Accelerometer.setUpdateInterval(100);
      
      subscription = Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        detectWorkoutMovement(accelerometerData);
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isActive, workoutType]);

  const detectWorkoutMovement = (accelerometerData: AccelerometerMeasurement) => {
    const { x, y, z } = accelerometerData;
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Add to movement buffer
    movementBuffer.current.push(magnitude);
    if (movementBuffer.current.length > 10) {
      movementBuffer.current.shift();
    }

    // Prevent double counting
    if (now - lastDetectionTime.current < 800) {
      return;
    }

    let detected = false;

    switch (workoutType) {
      case 'jumping-jacks':
        // Detect jumping motion - significant vertical acceleration
        detected = detectJumpingJacks(magnitude, z);
        break;
      case 'push-ups':
        // Detect push-up motion - phone likely on ground, detect up/down movement
        detected = detectPushUps(magnitude, y);
        break;
      case 'sit-ups':
        // Detect sit-up motion - phone on chest/stomach, detect forward/back movement
        detected = detectSitUps(magnitude, x, y);
        break;
    }

    if (detected) {
      lastDetectionTime.current = now;
      onMovementDetected();
    }
  };

  const detectJumpingJacks = (magnitude: number, z: number): boolean => {
    // Jumping jacks require significant overall movement and vertical component
    return magnitude > 2.0 && Math.abs(z) > 1.2;
  };

  const detectPushUps = (magnitude: number, y: number): boolean => {
    // Push-ups show movement in Y axis (up/down when phone is flat)
    return magnitude > 1.8 && Math.abs(y) > 1.0;
  };

  const detectSitUps = (magnitude: number, x: number, y: number): boolean => {
    // Sit-ups show movement in X and Y axes (torso rotation)
    return magnitude > 1.5 && (Math.abs(x) > 1.0 || Math.abs(y) > 1.0);
  };

  return null; // This component doesn't render anything
};

export default WorkoutDetector;