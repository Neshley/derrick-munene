/**
 * Categorized Domain Error Architecture for DM ARRANGIA.
 */

export class ArrangiaError extends Error {
  public readonly code: string;
  public readonly timestamp: number;
  public readonly userMessage: string;

  constructor(message: string, code: string = 'GENERIC_ERROR', userMessage?: string) {
    super(message);
    this.name = 'ArrangiaError';
    this.code = code;
    this.timestamp = Date.now();
    this.userMessage = userMessage || message;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AudioError extends ArrangiaError {
  constructor(message: string, code: string = 'AUDIO_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'An audio synthesizer error occurred.');
    this.name = 'AudioError';
  }
}

export class MidiError extends ArrangiaError {
  constructor(message: string, code: string = 'MIDI_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'A MIDI hardware or parsing error occurred.');
    this.name = 'MidiError';
  }
}

export class MediaError extends ArrangiaError {
  constructor(message: string, code: string = 'MEDIA_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'A media player or vault storage error occurred.');
    this.name = 'MediaError';
  }
}

export class StorageError extends ArrangiaError {
  constructor(message: string, code: string = 'STORAGE_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'Storage or persistence operation failed.');
    this.name = 'StorageError';
  }
}

export class PlatformError extends ArrangiaError {
  constructor(message: string, code: string = 'PLATFORM_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'Platform bridge operation failed.');
    this.name = 'PlatformError';
  }
}

export class AiError extends ArrangiaError {
  constructor(message: string, code: string = 'AI_ERROR', userMessage?: string) {
    super(message, code, userMessage || 'AI music director service failed.');
    this.name = 'AiError';
  }
}
