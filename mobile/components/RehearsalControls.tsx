import { View, Pressable, Text, StyleSheet } from 'react-native'
import * as haptics from '../lib/haptics'
import { colors, spacing } from '../theme'

type Props = {
  isRunning: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onAdvance: () => void
  onGoBack: () => void
  onRestart: () => void
  onStop: () => void
}

export function RehearsalControls({
  isRunning, isPaused,
  onStart, onPause, onResume, onAdvance, onGoBack, onRestart, onStop,
}: Props) {
  if (!isRunning && !isPaused) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.startButton} onPress={() => { haptics.mediumTap(); onStart() }}>
          <Text style={styles.startButtonText}>Begin Rehearsal</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable style={styles.iconButton} onPress={() => { haptics.lightTap(); onGoBack() }}>
          <Text style={styles.iconText}>◀</Text>
        </Pressable>

        {isPaused ? (
          <Pressable style={styles.playButton} onPress={() => { haptics.mediumTap(); onResume() }}>
            <Text style={styles.playText}>▶</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.playButton} onPress={() => { haptics.mediumTap(); onPause() }}>
            <Text style={styles.playText}>⏸</Text>
          </Pressable>
        )}

        <Pressable style={styles.iconButton} onPress={() => { haptics.lightTap(); onAdvance() }}>
          <Text style={styles.iconText}>▶</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.smallButton} onPress={onRestart}>
          <Text style={styles.smallButtonText}>Restart</Text>
        </Pressable>
        <Pressable style={[styles.smallButton, styles.stopButton]} onPress={onStop}>
          <Text style={styles.smallButtonText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.stageBg,
    borderTopWidth: 1,
    borderTopColor: colors.stageCard,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  startButton: {
    backgroundColor: colors.amber,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.stageDeep,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.stageCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.cream,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.amber,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    fontSize: 24,
    color: colors.stageDeep,
  },
  smallButton: {
    backgroundColor: colors.stageCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  stopButton: {
    backgroundColor: colors.burgundy,
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.cream,
  },
})
