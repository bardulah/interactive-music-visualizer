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
  private audioContext: AudioContext;
  private source: MediaElementAudioSourceNode;
  private destination: AudioDestinationNode;

  // Effect nodes
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private delay: DelayNode | null = null;
  private echoFeedback: GainNode | null = null;
  private echoMix: GainNode | null = null;

  private filter: BiquadFilterNode | null = null;

  private distortion: WaveShaperNode | null = null;
  private distortionGain: GainNode | null = null;

  constructor(
    audioContext: AudioContext,
    source: MediaElementAudioSourceNode,
    destination: AudioDestinationNode
  ) {
    this.audioContext = audioContext;
    this.source = source;
    this.destination = destination;
  }

  private createReverbImpulse(duration: number, decay: number): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }

    return impulse;
  }

  enableReverb(amount: number): void {
    if (!this.convolver) {
      this.convolver = this.audioContext.createConvolver();
      this.reverbGain = this.audioContext.createGain();
      this.dryGain = this.audioContext.createGain();

      // Create impulse response
      this.convolver.buffer = this.createReverbImpulse(2, 2);

      // Setup routing
      this.source.disconnect();
      this.source.connect(this.dryGain);
      this.source.connect(this.convolver);
      this.convolver.connect(this.reverbGain!);
    }

    if (this.reverbGain && this.dryGain) {
      this.reverbGain.gain.value = amount;
      this.dryGain.gain.value = 1 - amount * 0.5;
    }
  }

  disableReverb(): void {
    if (this.convolver && this.reverbGain && this.dryGain) {
      this.convolver.disconnect();
      this.reverbGain.disconnect();
      this.dryGain.disconnect();
      this.convolver = null;
      this.reverbGain = null;
      this.dryGain = null;
    }
  }

  enableEcho(delayTime: number, feedback: number): void {
    if (!this.delay) {
      this.delay = this.audioContext.createDelay(5.0);
      this.echoFeedback = this.audioContext.createGain();
      this.echoMix = this.audioContext.createGain();

      // Setup routing
      this.source.connect(this.delay);
      this.delay.connect(this.echoFeedback);
      this.echoFeedback.connect(this.delay);
      this.delay.connect(this.echoMix);
    }

    if (this.delay && this.echoFeedback && this.echoMix) {
      this.delay.delayTime.value = delayTime;
      this.echoFeedback.gain.value = feedback;
      this.echoMix.gain.value = 0.5;
    }
  }

  disableEcho(): void {
    if (this.delay && this.echoFeedback && this.echoMix) {
      this.delay.disconnect();
      this.echoFeedback.disconnect();
      this.echoMix.disconnect();
      this.delay = null;
      this.echoFeedback = null;
      this.echoMix = null;
    }
  }

  enableFilter(type: BiquadFilterType, frequency: number, q: number): void {
    if (!this.filter) {
      this.filter = this.audioContext.createBiquadFilter();
      this.source.connect(this.filter);
    }

    if (this.filter) {
      this.filter.type = type;
      this.filter.frequency.value = frequency;
      this.filter.Q.value = q;
    }
  }

  disableFilter(): void {
    if (this.filter) {
      this.filter.disconnect();
      this.filter = null;
    }
  }

  enableDistortion(amount: number): void {
    if (!this.distortion) {
      this.distortion = this.audioContext.createWaveShaper();
      this.distortionGain = this.audioContext.createGain();

      // Create distortion curve
      const samples = 44100;
      const curve = new Float32Array(samples);
      const deg = Math.PI / 180;

      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + amount * 100) * x * 20 * deg) / (Math.PI + amount * 100 * Math.abs(x));
      }

      this.distortion.curve = curve;
      this.distortion.oversample = '4x';

      this.source.connect(this.distortion);
      this.distortion.connect(this.distortionGain);
    }

    if (this.distortionGain) {
      this.distortionGain.gain.value = amount;
    }
  }

  disableDistortion(): void {
    if (this.distortion && this.distortionGain) {
      this.distortion.disconnect();
      this.distortionGain.disconnect();
      this.distortion = null;
      this.distortionGain = null;
    }
  }

  applyEffects(effects: AudioEffects): void {
    // Reverb
    if (effects.reverbEnabled) {
      this.enableReverb(effects.reverbAmount);
    } else {
      this.disableReverb();
    }

    // Echo
    if (effects.echoEnabled) {
      this.enableEcho(effects.echoDelay, effects.echoFeedback);
    } else {
      this.disableEcho();
    }

    // Filter
    if (effects.filterEnabled) {
      this.enableFilter(effects.filterType, effects.filterFrequency, effects.filterQ);
    } else {
      this.disableFilter();
    }

    // Distortion
    if (effects.distortionEnabled) {
      this.enableDistortion(effects.distortionAmount);
    } else {
      this.disableDistortion();
    }

    // Reconnect all active nodes to destination
    this.reconnectChain();
  }

  private reconnectChain(): void {
    // This would need to be more sophisticated to handle the full chain
    // For now, we'll use a simplified approach
    const activeNodes: AudioNode[] = [];

    if (this.dryGain) activeNodes.push(this.dryGain);
    if (this.reverbGain) activeNodes.push(this.reverbGain);
    if (this.echoMix) activeNodes.push(this.echoMix);
    if (this.filter) activeNodes.push(this.filter);
    if (this.distortionGain) activeNodes.push(this.distortionGain);

    // Connect all active nodes to destination
    activeNodes.forEach(node => {
      try {
        node.connect(this.destination);
      } catch (_e) {
        // Node might already be connected - ignore error
      }
    });
  }

  destroy(): void {
    this.disableReverb();
    this.disableEcho();
    this.disableFilter();
    this.disableDistortion();
  }
}
