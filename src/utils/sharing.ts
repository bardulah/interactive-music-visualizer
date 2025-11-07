import { VisualizationSettings, Preset } from '../types';

export class SharingManager {
  // Export preset as JSON file
  static exportPreset(preset: Preset): void {
    const dataStr = JSON.stringify(preset, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${preset.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Import preset from JSON file
  static async importPreset(file: File): Promise<Preset> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const preset = JSON.parse(e.target?.result as string);
          resolve(preset);
        } catch (error) {
          console.error('Failed to parse preset file:', error);
          reject(new Error('Invalid preset file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Generate shareable URL with preset encoded
  static generateShareableURL(settings: VisualizationSettings): string {
    const data = btoa(JSON.stringify(settings));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?preset=${encodeURIComponent(data)}`;
  }

  // Load settings from URL
  static loadFromURL(): VisualizationSettings | null {
    const params = new URLSearchParams(window.location.search);
    const presetData = params.get('preset');

    if (presetData) {
      try {
        const decoded = atob(decodeURIComponent(presetData));
        return JSON.parse(decoded);
      } catch (error) {
        console.error('Failed to load preset from URL:', error);
        return null;
      }
    }

    return null;
  }

  // Capture screenshot of canvas
  static captureScreenshot(canvas: HTMLCanvasElement, filename?: string): void {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `visualizer-screenshot-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  }

  // Share via Web Share API (if available)
  static async shareViaWebShare(data: {
    title?: string;
    text?: string;
    url?: string;
  }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        return false;
      }
    }
    return false;
  }

  // Copy to clipboard
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  // Share on Twitter
  static shareOnTwitter(text: string, url: string): void {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  }

  // Share on Facebook
  static shareOnFacebook(url: string): void {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  }

  // Share on Reddit
  static shareOnReddit(title: string, url: string): void {
    const redditUrl = `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(redditUrl, '_blank', 'width=800,height=600');
  }
}
