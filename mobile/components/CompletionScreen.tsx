import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

type Props = {
  onRestart: () => void
}

export function CompletionScreen({ onRestart }: Props) {
  const router = useRouter()
  const {
    linesNailedFirstTry, linesRevealed, linesSkipped, totalUserLines,
    reset,
  } = useScriptStore()

  const percentage = totalUserLines > 0
    ? Math.round((linesNailedFirstTry / totalUserLines) * 100)
    : 0

  const rating =
    percentage >= 90 ? 'Standing Ovation!' :
    percentage >= 70 ? 'Great Performance!' :
    percentage >= 50 ? 'Good Effort!' :
    'Keep Rehearsing!'

  return (
    <View style={styles.container}>
      <Text style={styles.rating}>{rating}</Text>
      <Text style={styles.score}>{percentage}%</Text>
      <Text style={styles.scoreLabel}>lines nailed first try</Text>

      <View style={styles.stats}>
        <StatRow label="First Try" value={linesNailedFirstTry} color={colors.success} />
        <StatRow label="Revealed" value={linesRevealed} color={colors.amber} />
        <StatRow label="Skipped" value={linesSkipped} color={colors.danger} />
        <StatRow label="Total" value={totalUserLines} color={colors.textSecondary} />
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartText}>Rehearse Again</Text>
        </Pressable>
        <Pressable
          style={styles.homeButton}
          onPress={() => { reset(); router.push('/') }}
        >
          <Text style={styles.homeText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  )
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  rating: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.amber,
    marginBottom: spacing.sm,
  },
  score: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.cream,
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  stats: {
    width: '100%',
    backgroundColor: colors.stageCard,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  restartButton: {
    backgroundColor: colors.amber,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  restartText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.stageDeep,
  },
  homeButton: {
    backgroundColor: colors.stageCard,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
})
