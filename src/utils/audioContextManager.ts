/**
 * Centralized Audio Context Manager
 * Manages a single AudioContext instance and effect chain connections
 * Ensures proper audio routing and prevents multiple context creation
 */

import { getAudioContextConstructor } from '../types/audio';

export class AudioContextManager {
  private static instance: AudioContext | null = null;
  private static analyser: AnalyserNode | null = null;
  private static currentSource: AudioNode | null = null;
  private static effectsNodes: AudioNode[] = [];

  /**
   * Get or create the singleton AudioContext instance
   */
  static getContext(): AudioContext {
    if (!this.instance || this.instance.state === 'closed') {
      const AudioContextConstructor = getAudioContextConstructor();
      this.instance = new AudioContextConstructor();
    }
    return this.instance;
  }

  /**
   * Get or create the analyser node
   */
  static getAnalyser(fftSize: number = 2048, smoothing: number = 0.8): AnalyserNode {
    const context = this.getContext();

    if (!this.analyser) {
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = fftSize;
      this.analyser.smoothingTimeConstant = smoothing;
    } else {
      this.analyser.fftSize = fftSize;
      this.analyser.smoothingTimeConstant = smoothing;
    }

    return this.analyser;
  }

  /**
   * Update analyser settings
   */
  static updateAnalyser(fftSize?: number, smoothing?: number): void {
    if (this.analyser) {
      if (fftSize !== undefined) {
        this.analyser.fftSize = fftSize;
      }
      if (smoothing !== undefined) {
        this.analyser.smoothingTimeConstant = smoothing;
      }
    }
  }

  /**
   * Connect a source through the effects chain to the analyser and destination
   * This is the key method that properly routes audio
   */
  static connectSource(source: AudioNode): void {
    const context = this.getContext();
    const analyser = this.getAnalyser();
    const destination = context.destination;

    // Disconnect previous source if exists
    if (this.currentSource) {
      try {
        this.currentSource.disconnect();
      } catch (_e) {
        // Already disconnected - ignore error
      }
    }

    this.currentSource = source;

    // If there are effects, chain them
    if (this.effectsNodes.length > 0) {
      // Source → First Effect
      source.connect(this.effectsNodes[0]);

      // Chain effects together
      for (let i = 0; i < this.effectsNodes.length - 1; i++) {
        this.effectsNodes[i].connect(this.effectsNodes[i + 1]);
      }

      // Last Effect → Analyser → Destination
      const lastEffect = this.effectsNodes[this.effectsNodes.length - 1];
      lastEffect.connect(analyser);
      analyser.connect(destination);
    } else {
      // No effects: Source → Analyser → Destination
      source.connect(analyser);
      analyser.connect(destination);
    }
  }

  /**
   * Add an effect node to the chain
   */
  static addEffect(effectNode: AudioNode): void {
    this.effectsNodes.push(effectNode);

    // Reconnect the current source with new effect
    if (this.currentSource) {
      this.connectSource(this.currentSource);
    }
  }

  /**
   * Remove an effect node from the chain
   */
  static removeEffect(effectNode: AudioNode): void {
    const index = this.effectsNodes.indexOf(effectNode);
    if (index > -1) {
      this.effectsNodes.splice(index, 1);

      // Disconnect the effect
      try {
        effectNode.disconnect();
      } catch (_e) {
        // Already disconnected - ignore error
      }

      // Reconnect the source
      if (this.currentSource) {
        this.connectSource(this.currentSource);
      }
    }
  }

  /**
   * Clear all effects
   */
  static clearEffects(): void {
    this.effectsNodes.forEach(node => {
      try {
        node.disconnect();
      } catch (_e) {
        // Already disconnected - ignore error
      }
    });
    this.effectsNodes = [];

    // Reconnect source without effects
    if (this.currentSource) {
      this.connectSource(this.currentSource);
    }
  }

  /**
   * Get the current effects chain
   */
  static getEffectsChain(): AudioNode[] {
    return [...this.effectsNodes];
  }

  /**
   * Resume context if suspended (for autoplay policies)
   */
  static async resume(): Promise<void> {
    const context = this.getContext();
    if (context.state === 'suspended') {
      await context.resume();
    }
  }

  /**
   * Get current context state
   */
  static getState(): AudioContextState {
    return this.getContext().state;
  }

  /**
   * Close the audio context (cleanup)
   */
  static async close(): Promise<void> {
    if (this.instance && this.instance.state !== 'closed') {
      // Disconnect everything
      this.clearEffects();

      if (this.currentSource) {
        try {
          this.currentSource.disconnect();
        } catch (_e) {
          // Already disconnected - ignore error
        }
      }

      if (this.analyser) {
        try {
          this.analyser.disconnect();
        } catch (_e) {
          // Already disconnected - ignore error
        }
      }

      await this.instance.close();
      this.instance = null;
      this.analyser = null;
      this.currentSource = null;
    }
  }

  /**
   * Get the destination node
   */
  static getDestination(): AudioDestinationNode {
    return this.getContext().destination;
  }

  /**
   * Create a media element source
   */
  static createMediaElementSource(element: HTMLMediaElement): MediaElementAudioSourceNode {
    return this.getContext().createMediaElementSource(element);
  }

  /**
   * Create any audio node
   */
  static createNode<T extends AudioNode>(
    nodeType: new (context: AudioContext) => T
  ): T {
    const context = this.getContext();
    return new nodeType(context);
  }
}
