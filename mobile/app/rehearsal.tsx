import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

export default function RehearsalScreen() {
  const { parsedScript, currentLineIndex, selectedCharacter, isRunning } = useScriptStore()

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scriptArea} contentContainerStyle={styles.scriptContent}>
        {parsedScript.map((entry, i) => (
          <View
            key={i}
            style={[
              styles.line,
              i === currentLineIndex && styles.activeLine,
              entry.character === selectedCharacter && styles.userLine,
            ]}
          >
            <Text style={[
              styles.character,
              entry.character === selectedCharacter && styles.userCharacter,
            ]}>
              {entry.character}
            </Text>
            <Text style={styles.lineText}>{entry.line}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <Text style={styles.placeholder}>
          Rehearsal controls will be implemented in Phase 4
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
  },
  scriptArea: {
    flex: 1,
  },
  scriptContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    padding: spacing.md,
    opacity: 0.5,
  },
  activeLine: {
    opacity: 1,
    borderWidth: 1,
    borderColor: colors.amber,
  },
  userLine: {
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  character: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userCharacter: {
    color: colors.amber,
  },
  lineText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  controls: {
    padding: spacing.lg,
    backgroundColor: colors.stageBg,
    borderTopWidth: 1,
    borderTopColor: colors.stageCard,
    alignItems: 'center',
  },
  placeholder: {
    color: colors.textDim,
    fontSize: 14,
  },
})
