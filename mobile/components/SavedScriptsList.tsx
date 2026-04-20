import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList, Alert } from 'react-native'
import { useScriptStore } from '@line-reader/shared'
import { getSavedScripts, deleteScript, type SavedScript } from '../lib/storage'
import { colors, spacing } from '../theme'

type Props = {
  onLoaded?: () => void
}

export function SavedScriptsList({ onLoaded }: Props) {
  const [scripts, setScripts] = useState<Record<string, SavedScript>>({})
  const { setParsedScript, setProject } = useScriptStore()

  const refresh = async () => {
    const saved = await getSavedScripts()
    setScripts(saved)
  }

  useEffect(() => {
    refresh()
  }, [])

  const entries = Object.entries(scripts).sort(
    ([, a], [, b]) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )

  if (entries.length === 0) return null

  const loadScript = (name: string, saved: SavedScript) => {
    setParsedScript(saved.script)
    setProject(null, name)
    onLoaded?.()
  }

  const confirmDelete = (name: string) => {
    Alert.alert('Delete Script', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteScript(name)
          refresh()
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Saved Scripts</Text>
      <FlatList
        data={entries}
        keyExtractor={([name]) => name}
        scrollEnabled={false}
        renderItem={({ item: [name, saved] }) => (
          <Pressable
            style={styles.item}
            onPress={() => loadScript(name, saved)}
            onLongPress={() => confirmDelete(name)}
          >
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.meta}>
              {saved.script.length} lines · {new Date(saved.savedAt).toLocaleDateString()}
            </Text>
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    backgroundColor: colors.stageCard,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
})
