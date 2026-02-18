
import { useRef, useCallback } from 'react';
import { CameraHandle } from '../components/CameraCapture';

export const useCamera = () => {
    const cameraRef = useRef<CameraHandle>(null);

    const onCaptureClick = useCallback((callback?: () => void) => {
        if (cameraRef.current) {
            callback?.();
            cameraRef.current.capture();
        }
    }, []);

    return {
        cameraRef,
        onCaptureClick
    };
};
