import { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { useRehearsal } from '../hooks/useRehearsal'
import { RehearsalControls } from '../components/RehearsalControls'
import { UserTurnInput } from '../components/UserTurnInput'
import { CompletionScreen } from '../components/CompletionScreen'
import { colors, spacing } from '../theme'

export default function RehearsalScreen() {
  const {
    parsedScript, currentLineIndex, selectedCharacter,
    isRunning, isPaused, userTurnPhase, practiceMode,
  } = useScriptStore()

  const {
    start, stop, manualAdvance, goBack, pause, resume, restart,
    handleTypedCorrect,
  } = useRehearsal()

  const scrollRef = useRef<ScrollView>(null)
  const linePositions = useRef<Record<number, number>>({})

  useEffect(() => {
    if (currentLineIndex >= 0 && scrollRef.current) {
      const y = linePositions.current[currentLineIndex]
      if (y !== undefined) {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 120), animated: true })
      }
    }
  }, [currentLineIndex])

  // Show completion screen when rehearsal ends naturally
  const isComplete = !isRunning && !isPaused && currentLineIndex >= parsedScript.length - 1 && currentLineIndex > 0

  if (isComplete) {
    return <CompletionScreen onRestart={restart} />
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        style={styles.scriptArea}
        contentContainerStyle={styles.scriptContent}
      >
        {parsedScript.map((entry, i) => {
          const isActive = i === currentLineIndex
          const isUser = entry.character === selectedCharacter
          const isPast = i < currentLineIndex
          const isHidden = isUser && !practiceMode && !isPast && !isActive

          return (
            <View
              key={i}
              onLayout={(e) => {
                linePositions.current[i] = e.nativeEvent.layout.y
              }}
              style={[
                styles.line,
                isActive && styles.activeLine,
                isUser && styles.userLine,
                isPast && styles.pastLine,
                entry.type === 'direction' && styles.directionLine,
              ]}
            >
              <Text style={[
                styles.character,
                isUser && styles.userCharacter,
                isActive && styles.activeCharacter,
              ]}>
                {entry.character}
              </Text>
              {isHidden ? (
                <Text style={styles.hiddenText}>• • •</Text>
              ) : (
                <Text style={[
                  styles.lineText,
                  isPast && styles.pastLineText,
                ]}>
                  {entry.line}
                </Text>
              )}
            </View>
          )
        })}
      </ScrollView>

      {userTurnPhase && (
        <UserTurnInput onCorrect={handleTypedCorrect} />
      )}

      <RehearsalControls
        isRunning={isRunning}
        isPaused={isPaused}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onAdvance={manualAdvance}
        onGoBack={goBack}
        onRestart={restart}
        onStop={stop}
      />
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
    paddingBottom: spacing.xxl,
  },
  line: {
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    padding: spacing.md,
    opacity: 0.4,
  },
  activeLine: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.amber,
    backgroundColor: colors.stageElevated,
  },
  userLine: {
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  pastLine: {
    opacity: 0.6,
  },
  directionLine: {
    borderLeftWidth: 3,
    borderLeftColor: colors.textDim,
    fontStyle: 'italic',
  },
  character: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  userCharacter: {
    color: colors.amberDim,
  },
  activeCharacter: {
    color: colors.amber,
  },
  lineText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  pastLineText: {
    color: colors.textSecondary,
  },
  hiddenText: {
    fontSize: 15,
    color: colors.textDim,
    letterSpacing: 4,
  },
})
