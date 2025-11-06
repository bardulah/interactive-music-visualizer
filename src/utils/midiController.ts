export interface MIDIMapping {
  controlNumber: number;
  parameter: string;
  min: number;
  max: number;
}

export interface MIDIDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export class MIDIController {
  private midiAccess: MIDIAccess | null = null;
  private activeInput: MIDIInput | null = null;
  private mappings: Map<number, MIDIMapping> = new Map();
  private listeners: Map<string, ((value: number) => void)[]> = new Map();

  // Check if Web MIDI API is available
  static isSupported(): boolean {
    return 'requestMIDIAccess' in navigator;
  }

  // Initialize MIDI access
  async initialize(): Promise<boolean> {
    if (!MIDIController.isSupported()) {
      console.warn('Web MIDI API not supported in this browser');
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      console.log('MIDI Access initialized');
      return true;
    } catch (error) {
      console.error('Failed to get MIDI access:', error);
      return false;
    }
  }

  // Get list of available MIDI devices
  getAvailableDevices(): MIDIDevice[] {
    if (!this.midiAccess) return [];

    const devices: MIDIDevice[] = [];
    const inputs = this.midiAccess.inputs.values();

    for (const input of inputs) {
      devices.push({
        id: input.id,
        name: input.name || 'Unknown Device',
        manufacturer: input.manufacturer || 'Unknown',
      });
    }

    return devices;
  }

  // Connect to a MIDI device
  connectDevice(deviceId: string): boolean {
    if (!this.midiAccess) return false;

    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) return false;

    // Disconnect previous input
    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
    }

    this.activeInput = input;
    this.activeInput.onmidimessage = this.handleMIDIMessage.bind(this);

    console.log('Connected to MIDI device:', input.name);
    return true;
  }

  // Disconnect from current device
  disconnect(): void {
    if (this.activeInput) {
      this.activeInput.onmidimessage = null;
      this.activeInput = null;
    }
  }

  // Handle incoming MIDI messages
  private handleMIDIMessage(event: MIDIMessageEvent): void {
    const data = event.data;
    if (!data || data.length < 3) return;

    const status = data[0];
    const data1 = data[1];
    const data2 = data[2];

    // Control Change messages (status 176-191)
    if (status >= 176 && status <= 191) {
      const controlNumber = data1;
      const value = data2; // 0-127

      // Check if this control is mapped
      const mapping = this.mappings.get(controlNumber);
      if (mapping) {
        // Normalize value to the mapped range
        const normalizedValue = this.normalizeValue(value, 0, 127, mapping.min, mapping.max);
        this.notifyListeners(mapping.parameter, normalizedValue);
      }

      // Also notify raw control listeners
      this.notifyListeners(`cc${controlNumber}`, value);
    }
  }

  // Normalize MIDI value to target range
  private normalizeValue(
    value: number,
    sourceMin: number,
    sourceMax: number,
    targetMin: number,
    targetMax: number
  ): number {
    const normalized = (value - sourceMin) / (sourceMax - sourceMin);
    return targetMin + normalized * (targetMax - targetMin);
  }

  // Set a control mapping
  setMapping(controlNumber: number, parameter: string, min: number = 0, max: number = 1): void {
    this.mappings.set(controlNumber, {
      controlNumber,
      parameter,
      min,
      max,
    });
  }

  // Remove a control mapping
  removeMapping(controlNumber: number): void {
    this.mappings.delete(controlNumber);
  }

  // Get all mappings
  getMappings(): MIDIMapping[] {
    return Array.from(this.mappings.values());
  }

  // Clear all mappings
  clearMappings(): void {
    this.mappings.clear();
  }

  // Add a listener for parameter changes
  addListener(parameter: string, callback: (value: number) => void): void {
    if (!this.listeners.has(parameter)) {
      this.listeners.set(parameter, []);
    }
    const callbacks = this.listeners.get(parameter);
    if (callbacks) {
      callbacks.push(callback);
    }
  }

  // Remove a listener
  removeListener(parameter: string, callback: (value: number) => void): void {
    const callbacks = this.listeners.get(parameter);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Notify all listeners for a parameter
  private notifyListeners(parameter: string, value: number): void {
    const callbacks = this.listeners.get(parameter);
    if (callbacks) {
      callbacks.forEach(callback => callback(value));
    }
  }

  // Learn mode - wait for next MIDI control and return its number
  async learnControl(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.activeInput) {
        resolve(-1);
        return;
      }

      const originalHandler = this.activeInput.onmidimessage;

      this.activeInput.onmidimessage = (event) => {
        const data = event.data;
        if (!data || data.length < 2) return;

        const status = data[0];
        const data1 = data[1];

        // Control Change messages
        if (status >= 176 && status <= 191) {
          if (this.activeInput) {
            this.activeInput.onmidimessage = originalHandler;
          }
          resolve(data1);
        }
      };

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.activeInput) {
          this.activeInput.onmidimessage = originalHandler;
        }
        resolve(-1);
      }, 10000);
    });
  }

  // Save mappings to localStorage
  saveMappings(): void {
    const mappingsArray = Array.from(this.mappings.values());
    localStorage.setItem('midi-mappings', JSON.stringify(mappingsArray));
  }

  // Load mappings from localStorage
  loadMappings(): void {
    const stored = localStorage.getItem('midi-mappings');
    if (stored) {
      try {
        const mappingsArray: MIDIMapping[] = JSON.parse(stored);
        this.mappings.clear();
        mappingsArray.forEach(mapping => {
          this.mappings.set(mapping.controlNumber, mapping);
        });
      } catch (error) {
        console.error('Failed to load MIDI mappings:', error);
      }
    }
  }
}
