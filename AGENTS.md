# DM ARRANGIA — Developer & Agent Directives

## 📜 Architectural Maintenance & Documentation Contract

### Mandate: Documentation Synchronization on Every App Update
Whenever any feature, voice, style, audio processor, UI component, MIDI mapping, backend API route, schema, or configuration is added, modified, or refactored in DM ARRANGIA:
1. **Update `ARCHITECTURE_AND_DEVELOPER_GUIDE.md`**: The master developer guide must be kept 100% accurate, complete, and synchronized with the latest code patterns, file paths, recipes, and architecture.
2. **Update `README.md`**: Keep feature descriptions, test metrics, and quick-start instructions aligned.
3. **Run Verification**: Always run `npm run lint` and `compile_applet` (and `npm test`) to ensure all unit tests and builds remain green.

### Core Architecture Rules
- **Port & Host**: The server binds to `0.0.0.0:3000`. Port 3000 is the only externally accessible port.
- **Full-Stack Security**: `process.env.GEMINI_API_KEY` is strictly server-side (in `server.ts` and `src/server/aiRouter.ts`). Never expose API keys to the browser client or create browser input fields for keys.
- **Pure Algorithmic Audio**: Core sound synthesis uses native Web Audio API nodes (`OscillatorNode`, `GainNode`, `BiquadFilterNode`, `ConvolverNode`, etc.).
- **Two-Tier Lookahead Scheduling**: Arranger timing uses a 25ms timer scanning a 100ms lookahead window scheduled on `AudioContext.currentTime`.
- **Yamaha .STY Compatibility**: Retain and preserve the binary parser and CASM/NTT chord transposition logic.
