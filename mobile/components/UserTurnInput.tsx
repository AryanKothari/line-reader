import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

type Props = {
  onCorrect: () => void
}

export function UserTurnInput({ onCorrect }: Props) {
  const {
    userTurnPhase, attemptsLeft, lastAttempt,
    parsedScript, currentLineIndex,
    submitAttempt, revealLine,
  } = useScriptStore()
  const [text, setText] = useState('')

  if (!userTurnPhase) return null

  const currentLine = parsedScript[currentLineIndex]?.line || ''

  const handleSubmit = () => {
    if (!text.trim()) return
    const correct = submitAttempt(text.trim())
    setText('')
    if (correct) {
      onCorrect()
    }
  }

  if (userTurnPhase === 'revealed') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Your line was:</Text>
        <Text style={styles.revealedLine}>{currentLine}</Text>
        <Text style={styles.hint}>Say the line to continue</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your turn — say your line!</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type your line..."
          placeholderTextColor={colors.textDim}
          onSubmitEditing={handleSubmit}
          returnKeyType="send"
          autoFocus
        />
        <Pressable style={styles.sendButton} onPress={handleSubmit}>
          <Text style={styles.sendText}>→</Text>
        </Pressable>
      </View>

      <View style={styles.meta}>
        <Text style={styles.attempts}>
          {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} left
        </Text>
        <Pressable onPress={revealLine}>
          <Text style={styles.revealButton}>Show Line</Text>
        </Pressable>
      </View>

      {lastAttempt ? (
        <Text style={styles.lastAttempt}>
          Last attempt: "{lastAttempt}"
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.stageElevated,
    borderTopWidth: 1,
    borderTopColor: colors.amber,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.amber,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 15,
    color: colors.cream,
  },
  sendButton: {
    backgroundColor: colors.amber,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.stageDeep,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  attempts: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  revealButton: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.amberDim,
  },
  lastAttempt: {
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  revealedLine: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
})
