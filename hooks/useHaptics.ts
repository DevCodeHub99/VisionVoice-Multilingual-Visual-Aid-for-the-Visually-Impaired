
export const useHaptics = () => {
    const triggerHaptic = (pattern: number | number[] = 50) => {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    return {
        triggerHaptic
    };
};
