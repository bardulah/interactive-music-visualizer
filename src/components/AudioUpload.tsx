import { useRef } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
  className?: string;
}

export const AudioUpload: React.FC<Props> = ({ onFileSelect, className = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={className}>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="glass-effect rounded-xl p-12 cursor-pointer hover:bg-dark-surface transition-all border-2 border-dashed border-dark-border hover:border-purple-500"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-bold mb-2">Upload Your Music</h3>
          <p className="text-gray-400 mb-4">
            Drag and drop or click to select an audio file
          </p>
          <p className="text-sm text-gray-500">
            Supports MP3, WAV, OGG, M4A, and more
          </p>
        </div>
      </div>
    </div>
  );
};
