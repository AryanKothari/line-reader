import type { Character } from '@/types'

let characterVoiceMap: Record<string, SpeechSynthesisVoice> = {}

export function getVoices(): SpeechSynthesisVoice[] {
  return speechSynthesis.getVoices()
}

export function getEnglishVoices(): SpeechSynthesisVoice[] {
  return getVoices().filter(v => v.lang.startsWith('en'))
}

export function assignVoices(characters: Character[], userCharacter: string) {
  const englishVoices = getEnglishVoices()
  if (!englishVoices.length) return

  const used = new Set<string>()
  characterVoiceMap = {}

  for (const char of characters) {
    if (char.name === userCharacter) continue
    const voice = englishVoices.find(v => !used.has(v.name)) || englishVoices[0]
    characterVoiceMap[char.name] = voice
    used.add(voice.name)
  }

  const narratorVoice = englishVoices.find(v => !used.has(v.name)) || englishVoices[englishVoices.length - 1]
  characterVoiceMap['__narrator__'] = narratorVoice
}

export function setVoiceForCharacter(name: string, voice: SpeechSynthesisVoice) {
  characterVoiceMap[name] = voice
}

export function getCharacterVoiceMap() {
  return characterVoiceMap
}

export function speak(text: string, characterName: string): Promise<void> {
  return new Promise(resolve => {
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)

    const isNarrator = characterName === 'STAGE DIRECTION' || characterName === '__narrator__'
    const voice = isNarrator
      ? characterVoiceMap['__narrator__']
      : characterVoiceMap[characterName]

    if (voice) utterance.voice = voice

    if (isNarrator) {
      utterance.rate = 0.85
      utterance.pitch = 0.7
      utterance.volume = 0.8
    } else {
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
    }

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  speechSynthesis.cancel()
}
