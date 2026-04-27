import { Pressable, Text, StyleSheet, Alert } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { parseFromText, useScriptStore } from '@line-reader/shared'
import { colors, spacing } from '../theme'

type Props = {
  onParsed?: () => void
}

export function FilePicker({ onParsed }: Props) {
  const { setParsedScript, setProject } = useScriptStore()

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/json',
          'application/pdf',
        ],
        copyToCacheDirectory: true,
      })

      if (result.canceled || !result.assets?.[0]) return

      const asset = result.assets[0]
      const { uri, name, mimeType } = asset

      if (mimeType === 'application/pdf') {
        Alert.alert('PDF Support', 'PDF parsing will be available in a future update. Please use .txt or .json files for now.')
        return
      }

      const content = await FileSystem.readAsStringAsync(uri)

      if (mimeType === 'application/json' || name.endsWith('.json')) {
        try {
          const entries = JSON.parse(content)
          if (Array.isArray(entries)) {
            setParsedScript(entries)
            setProject(null, name.replace(/\.[^.]+$/, ''))
            onParsed?.()
            return
          }
        } catch {
          Alert.alert('Error', 'Invalid JSON file')
          return
        }
      }

      const { script } = parseFromText(content)
      if (script.length === 0) {
        Alert.alert('Error', 'No dialogue found in this file')
        return
      }

      setParsedScript(script)
      setProject(null, name.replace(/\.[^.]+$/, ''))
      onParsed?.()
    } catch (err: any) {
      console.error('FilePicker error:', err)
      Alert.alert('Error', `Failed to read file: ${err?.message || 'Unknown error'}`)
    }
  }

  return (
    <Pressable style={styles.button} onPress={pickFile}>
      <Text style={styles.icon}>📄</Text>
      <Text style={styles.text}>Choose Script File</Text>
      <Text style={styles.hint}>.txt or .json</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.stageCard,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.textDim,
    borderStyle: 'dashed',
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
  },
})
