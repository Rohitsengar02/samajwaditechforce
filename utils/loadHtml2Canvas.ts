// Utility to load html2canvas library dynamically on web
export const loadHtml2Canvas = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (typeof window !== 'undefined' && (window as any).html2canvas) {
            resolve();
            return;
        }

        // Only load on web
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            reject(new Error('Not running in browser'));
            return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="html2canvas"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve());
            existingScript.addEventListener('error', () => reject(new Error('Failed to load html2canvas')));
            return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load html2canvas'));
        document.head.appendChild(script);
    });
};
