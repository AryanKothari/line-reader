import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

export default function SetupScreen() {
  const router = useRouter()
  const { characters, selectedCharacter, selectCharacter } = useScriptStore()

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.heading}>Choose Your Character</Text>

      <FlatList
        data={characters}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.card,
              selectedCharacter === item.name && styles.cardSelected,
            ]}
            onPress={() => selectCharacter(item.name)}
          >
            <Text style={[
              styles.cardName,
              selectedCharacter === item.name && styles.cardNameSelected,
            ]}>
              {item.name}
            </Text>
            <Text style={styles.cardLines}>
              {item.lineCount} line{item.lineCount !== 1 ? 's' : ''}
            </Text>
          </Pressable>
        )}
      />

      {selectedCharacter && (
        <Pressable
          style={styles.startButton}
          onPress={() => router.push('/rehearsal')}
        >
          <Text style={styles.startButtonText}>Start Rehearsal</Text>
        </Pressable>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
    padding: spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.stageCard,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.amber,
    backgroundColor: colors.stageElevated,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardNameSelected: {
    color: colors.amber,
  },
  cardLines: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  startButton: {
    backgroundColor: colors.amber,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.stageDeep,
  },
})
