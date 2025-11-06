/**
 * Refactored Audio Effects Processor
 * Properly integrates with AudioContextManager for real audio processing
 */

import { AudioContextManager } from './audioContextManager';

export interface AudioEffects {
  reverbEnabled: boolean;
  reverbAmount: number;
  echoEnabled: boolean;
  echoDelay: number;
  echoFeedback: number;
  filterEnabled: boolean;
  filterType: BiquadFilterType;
  filterFrequency: number;
  filterQ: number;
  distortionEnabled: boolean;
  distortionAmount: number;
}

export class AudioEffectsProcessor {
  // Effect nodes
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private reverbMix: GainNode | null = null;

  private delay: DelayNode | null = null;
  private echoFeedbackGain: GainNode | null = null;
  private echoMix: GainNode | null = null;

  private filter: BiquadFilterNode | null = null;

  private distortion: WaveShaperNode | null = null;
  private distortionGain: GainNode | null = null;

  private currentEffects: AudioEffects;

  constructor() {
    this.currentEffects = {
      reverbEnabled: false,
      reverbAmount: 0.3,
      echoEnabled: false,
      echoDelay: 0.5,
      echoFeedback: 0.4,
      filterEnabled: false,
      filterType: 'lowpass',
      filterFrequency: 1000,
      filterQ: 1.0,
      distortionEnabled: false,
      distortionAmount: 0.3,
    };
  }

  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const context = AudioContextManager.getContext();
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return impulse;
  }

  private createDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount * 100) * x * 20 * deg) / (Math.PI + amount * 100 * Math.abs(x));
    }

    return curve;
  }

  /**
   * Apply effects configuration
   * This completely rebuilds the effects chain
   */
  applyEffects(effects: AudioEffects): void {
    this.currentEffects = effects;
    const context = AudioContextManager.getContext();

    // Clear existing effects from manager
    AudioContextManager.clearEffects();

    // Create chain based on enabled effects
    const chain: AudioNode[] = [];

    // 1. Distortion (first for character)
    if (effects.distortionEnabled) {
      if (!this.distortion) {
        this.distortion = context.createWaveShaper();
        this.distortionGain = context.createGain();
      }

      this.distortion.curve = this.createDistortionCurve(effects.distortionAmount) as any;
      this.distortion.oversample = '4x';
      this.distortionGain!.gain.value = 0.8; // Reduce gain to prevent clipping

      chain.push(this.distortion, this.distortionGain!);
    }

    // 2. Filter
    if (effects.filterEnabled) {
      if (!this.filter) {
        this.filter = context.createBiquadFilter();
      }

      this.filter.type = effects.filterType;
      this.filter.frequency.value = effects.filterFrequency;
      this.filter.Q.value = effects.filterQ;

      chain.push(this.filter);
    }

    // 3. Echo/Delay
    if (effects.echoEnabled) {
      if (!this.delay) {
        this.delay = context.createDelay(5.0);
        this.echoFeedbackGain = context.createGain();
        this.echoMix = context.createGain();
      }

      this.delay.delayTime.value = effects.echoDelay;
      this.echoFeedbackGain!.gain.value = effects.echoFeedback;
      this.echoMix!.gain.value = 0.7; // Mix level

      // Echo needs special routing: input → delay → feedback → delay (loop)
      // We'll create a feedback loop within the delay node
      chain.push(this.delay);

      // Connect feedback loop
      this.delay.connect(this.echoFeedbackGain!);
      this.echoFeedbackGain!.connect(this.delay);
    }

    // 4. Reverb (last for ambience)
    if (effects.reverbEnabled) {
      if (!this.convolver) {
        this.convolver = context.createConvolver();
        this.reverbGain = context.createGain();
        this.reverbMix = context.createGain();

        // Create impulse response
        this.convolver.buffer = this.createReverbImpulse(2, 2);
      }

      this.reverbGain!.gain.value = effects.reverbAmount;
      this.reverbMix!.gain.value = 0.7; // Mix level

      chain.push(this.convolver, this.reverbGain!);
    }

    // Add all nodes to manager's chain
    chain.forEach(node => {
      AudioContextManager.addEffect(node);
    });
  }

  /**
   * Update individual effect parameters without rebuilding entire chain
   */
  updateReverbAmount(amount: number): void {
    if (this.reverbGain && this.currentEffects.reverbEnabled) {
      this.reverbGain.gain.value = amount;
      this.currentEffects.reverbAmount = amount;
    }
  }

  updateEchoDelay(delay: number): void {
    if (this.delay && this.currentEffects.echoEnabled) {
      this.delay.delayTime.value = delay;
      this.currentEffects.echoDelay = delay;
    }
  }

  updateEchoFeedback(feedback: number): void {
    if (this.echoFeedbackGain && this.currentEffects.echoEnabled) {
      this.echoFeedbackGain.gain.value = feedback;
      this.currentEffects.echoFeedback = feedback;
    }
  }

  updateFilterFrequency(frequency: number): void {
    if (this.filter && this.currentEffects.filterEnabled) {
      this.filter.frequency.value = frequency;
      this.currentEffects.filterFrequency = frequency;
    }
  }

  updateFilterQ(q: number): void {
    if (this.filter && this.currentEffects.filterEnabled) {
      this.filter.Q.value = q;
      this.currentEffects.filterQ = q;
    }
  }

  updateFilterType(type: BiquadFilterType): void {
    if (this.filter && this.currentEffects.filterEnabled) {
      this.filter.type = type;
      this.currentEffects.filterType = type;
    }
  }

  updateDistortionAmount(amount: number): void {
    if (this.distortion && this.currentEffects.distortionEnabled) {
      this.distortion.curve = this.createDistortionCurve(amount) as any;
      this.currentEffects.distortionAmount = amount;
    }
  }

  /**
   * Get current effects configuration
   */
  getCurrentEffects(): AudioEffects {
    return { ...this.currentEffects };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Disconnect all effect nodes
    [
      this.convolver,
      this.reverbGain,
      this.reverbMix,
      this.delay,
      this.echoFeedbackGain,
      this.echoMix,
      this.filter,
      this.distortion,
      this.distortionGain,
    ].forEach(node => {
      if (node) {
        try {
          node.disconnect();
        } catch (_e) {
          // Already disconnected - ignore error
        }
      }
    });

    // Clear from manager
    AudioContextManager.clearEffects();
  }
}
