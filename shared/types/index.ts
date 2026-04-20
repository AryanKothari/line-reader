export type ScriptEntry = {
  character: string
  line: string
  type: 'dialogue' | 'direction'
}

export type Script = {
  id: string
  title: string
  entries: ScriptEntry[]
  created_at: string
  updated_at: string
  user_id: string
}

export type Character = {
  name: string
  lineCount: number
}

export type ParseResult = {
  script: ScriptEntry[]
  characters: Character[]
}

export type SpeechResult = {
  final: string
  interim: string
}
