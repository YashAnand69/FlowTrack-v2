import { audioEngine } from './audio-engine'

export const soundEngine = {
  playClick: () => audioEngine.playClick(),
  playHover: () => audioEngine.playHover(),
  playSuccess: () => audioEngine.playSuccess(),
  playChime: (isDark?: boolean) => audioEngine.playChime(isDark),
  playDelete: () => audioEngine.playDelete(),
  toggleBGM: () => audioEngine.toggleBGM(),
  startBGM: () => audioEngine.startBGM(),
  stopBGM: () => audioEngine.stopBGM(),
  isPlayingBGM: () => audioEngine.isPlaying(),
}
