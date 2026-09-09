/**
 * Microphone & Vocal Input Service
 * Cross-platform audio input management for Web/PWA and Desktop.
 */

import { capabilities } from '../../platform/capabilities';

export interface MicrophoneDeviceInfo {
  deviceId: string;
  label: string;
  groupId?: string;
}

export interface IMicrophoneService {
  isSupported(): boolean;
  hasPermission(): Promise<boolean>;
  requestStream(constraints?: MediaStreamConstraints): Promise<MediaStream | null>;
  getAudioInputDevices(): Promise<MicrophoneDeviceInfo[]>;
  stopStream(stream: MediaStream | null): void;
  getPreferredConstraints(): MediaTrackConstraints;
}

export class MicrophoneService implements IMicrophoneService {
  public isSupported(): boolean {
    return capabilities.microphone;
  }

  public async hasPermission(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
      return false;
    }
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch {
      return false;
    }
  }

  public getPreferredConstraints(): MediaTrackConstraints {
    return {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      channelCount: { ideal: 2 },
      sampleRate: { ideal: 48000 },
    };
  }

  public async requestStream(customConstraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    if (!this.isSupported()) return null;

    try {
      const constraints: MediaStreamConstraints = customConstraints || {
        audio: this.getPreferredConstraints(),
      };
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn('MicrophoneService stream request error:', err);
      return null;
    }
  }

  public async getAudioInputDevices(): Promise<MicrophoneDeviceInfo[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'audioinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${index + 1}`,
          groupId: d.groupId,
        }));
    } catch (err) {
      console.warn('Failed to enumerate audio input devices:', err);
      return [];
    }
  }

  public stopStream(stream: MediaStream | null): void {
    if (!stream) return;
    try {
      stream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.warn('Error stopping microphone stream:', e);
    }
  }
}

export const microphoneService = new MicrophoneService();
export default microphoneService;
