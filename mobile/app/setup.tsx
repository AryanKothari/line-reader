import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

export default function SetupScreen() {
  const router = useRouter()
  const {
    characters, selectedCharacter, selectCharacter,
    sceneNotes, setSceneNotes,
  } = useScriptStore()
  const [showNotes, setShowNotes] = useState(false)

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.heading}>Choose Your Character</Text>

      <FlatList
        data={characters}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          <View style={styles.notesSection}>
            <Pressable
              style={styles.notesToggle}
              onPress={() => setShowNotes(!showNotes)}
            >
              <Text style={styles.notesToggleText}>
                Scene Notes {showNotes ? '▲' : '▼'}
              </Text>
            </Pressable>
            {showNotes && (
              <TextInput
                style={styles.notesInput}
                value={sceneNotes}
                onChangeText={setSceneNotes}
                placeholder="Add context for AI voices (mood, setting, etc.)"
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          </View>
        }
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
        <View style={styles.footer}>
          <Pressable
            style={styles.startButton}
            onPress={() => router.push('/rehearsal')}
          >
            <Text style={styles.startButtonText}>Start Rehearsal</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: 100,
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
  notesSection: {
    marginTop: spacing.lg,
  },
  notesToggle: {
    paddingVertical: spacing.sm,
  },
  notesToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notesInput: {
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    minHeight: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.stageBg,
    borderTopWidth: 1,
    borderTopColor: colors.stageCard,
    padding: spacing.md,
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
})
