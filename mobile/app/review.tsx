import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore } from '@line-reader/shared'
import { saveScript } from '../lib/storage'
import { colors, spacing } from '../theme'

export default function ReviewScreen() {
  const router = useRouter()
  const {
    parsedScript, projectTitle, updateLine, deleteLine,
    updateCharacter, characters,
  } = useScriptStore()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  if (parsedScript.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No script loaded</Text>
          <Pressable style={styles.button} onPress={() => router.push('/')}>
            <Text style={styles.buttonText}>Upload Script</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditText(parsedScript[index].line)
  }

  const saveEdit = () => {
    if (editingIndex !== null) {
      updateLine(editingIndex, editText)
      setEditingIndex(null)
    }
  }

  const handleDelete = (index: number) => {
    Alert.alert('Delete Line', 'Remove this line from the script?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteLine(index) },
    ])
  }

  const handleSaveLocally = async () => {
    const name = projectTitle || 'Untitled Script'
    await saveScript(name, parsedScript)
    Alert.alert('Saved', `"${name}" saved to device`)
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={parsedScript}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Pressable
            style={[styles.line, item.type === 'direction' && styles.direction]}
            onPress={() => startEdit(index)}
            onLongPress={() => handleDelete(index)}
          >
            <Text style={styles.character}>{item.character}</Text>
            {editingIndex === index ? (
              <TextInput
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                onSubmitEditing={saveEdit}
                onBlur={saveEdit}
                autoFocus
                multiline
                returnKeyType="done"
                placeholderTextColor={colors.textDim}
              />
            ) : (
              <Text style={styles.lineText}>{item.line}</Text>
            )}
          </Pressable>
        )}
      />

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSaveLocally}>
          <Text style={styles.saveButtonText}>Save to Device</Text>
        </Pressable>
        <Pressable
          style={styles.continueButton}
          onPress={() => router.push('/setup')}
        >
          <Text style={styles.continueButtonText}>Continue to Setup</Text>
        </Pressable>
      </View>
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
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.amber,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.stageDeep,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 100,
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
  editInput: {
    fontSize: 15,
    color: colors.cream,
    backgroundColor: colors.stageHover,
    borderRadius: 6,
    padding: spacing.sm,
    lineHeight: 22,
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
    flexDirection: 'row',
    gap: spacing.sm,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.stageCard,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  continueButton: {
    flex: 1,
    backgroundColor: colors.amber,
    paddingVertical: spacing.sm + 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.stageDeep,
  },
})
