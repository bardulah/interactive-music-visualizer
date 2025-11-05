import { useState } from 'react';
import { VisualizationSettings, Preset } from '../types';
import { SharingManager } from '../utils/sharing';

interface Props {
  settings: VisualizationSettings;
  currentPreset?: Preset;
  onImportPreset: (preset: Preset) => void;
  className?: string;
}

export const SharingPanel: React.FC<Props> = ({
  settings,
  currentPreset,
  onImportPreset,
  className = '',
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleExportPreset = () => {
    if (currentPreset) {
      SharingManager.exportPreset(currentPreset);
    }
  };

  const handleImportPreset = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const preset = await SharingManager.importPreset(file);
          onImportPreset(preset);
        } catch (error) {
          alert('Failed to import preset. Please check the file format.');
        }
      }
    };
    input.click();
  };

  const handleShareURL = async () => {
    const url = SharingManager.generateShareableURL(settings);
    const shared = await SharingManager.shareViaWebShare({
      title: 'Check out my music visualizer!',
      text: 'I created this awesome visualization',
      url: url,
    });

    if (!shared) {
      // Fallback to copying URL
      const copied = await SharingManager.copyToClipboard(url);
      if (copied) {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    }
  };

  const handleCopyURL = async () => {
    const url = SharingManager.generateShareableURL(settings);
    const copied = await SharingManager.copyToClipboard(url);
    if (copied) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const url = SharingManager.generateShareableURL(settings);
    SharingManager.shareOnTwitter('Check out my music visualizer! 🎵✨', url);
  };

  const handleShareFacebook = () => {
    const url = SharingManager.generateShareableURL(settings);
    SharingManager.shareOnFacebook(url);
  };

  const handleShareReddit = () => {
    const url = SharingManager.generateShareableURL(settings);
    SharingManager.shareOnReddit('My Music Visualizer Configuration', url);
  };

  const handleScreenshot = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      SharingManager.captureScreenshot(canvas);
    }
  };

  return (
    <div className={`glass-effect rounded-xl p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-6 glow-text">Share & Export</h2>

      {/* Export/Import Preset */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Preset Files</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportPreset}
            disabled={!currentPreset}
            className={`px-4 py-2 rounded-lg transition-all ${
              currentPreset
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Export
          </button>
          <button
            onClick={handleImportPreset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            Import
          </button>
        </div>
      </div>

      {/* Share URL */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Share Configuration</h3>
        <button
          onClick={handleShareURL}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all mb-2"
        >
          {copiedUrl ? 'Copied!' : 'Share Link'}
        </button>
        <button
          onClick={handleCopyURL}
          className="w-full px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-all"
        >
          Copy URL
        </button>
      </div>

      {/* Social Sharing */}
      <div className="mb-6">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="w-full px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-all mb-2"
        >
          Share on Social Media {showShareMenu ? '▲' : '▼'}
        </button>
        {showShareMenu && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              onClick={handleShareTwitter}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm transition-all"
              title="Share on Twitter"
            >
              𝕏
            </button>
            <button
              onClick={handleShareFacebook}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded text-sm transition-all"
              title="Share on Facebook"
            >
              f
            </button>
            <button
              onClick={handleShareReddit}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-all"
              title="Share on Reddit"
            >
              ⓡ
            </button>
          </div>
        )}
      </div>

      {/* Screenshot */}
      <div>
        <h3 className="text-sm font-medium mb-3">Capture</h3>
        <button
          onClick={handleScreenshot}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-all"
        >
          📸 Take Screenshot
        </button>
      </div>
    </div>
  );
};
