import { View, Text, StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

export default function ReviewScreen() {
  const { parsedScript } = useScriptStore()

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {parsedScript.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No script loaded</Text>
        </View>
      ) : (
        <FlatList
          data={parsedScript}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <View style={[styles.line, item.type === 'direction' && styles.direction]}>
              <Text style={styles.character}>
                {item.character}
              </Text>
              <Text style={styles.lineText}>{item.line}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: {
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    padding: spacing.md,
  },
  direction: {
    backgroundColor: colors.stageElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.textDim,
  },
  character: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.amber,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  lineText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
})
