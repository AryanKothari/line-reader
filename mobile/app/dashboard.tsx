import { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useScriptStore, getProjects, deleteProject, type Project } from '@line-reader/shared'
import { useAuth } from '../lib/auth-context'
import { colors, spacing } from '../theme'

export default function DashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { setParsedScript, setProject, selectCharacter } = useScriptStore()

  const loadProjects = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      const data = await getProjects()
      setProjects(data)
    } catch {
      Alert.alert('Error', 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const openProject = (project: Project) => {
    setParsedScript(project.entries)
    setProject(project.id, project.title)
    if (project.selected_character) {
      selectCharacter(project.selected_character)
    }
    router.push('/review')
  }

  const confirmDelete = (project: Project) => {
    Alert.alert('Delete Project', `Delete "${project.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(project.id)
          loadProjects()
        },
      },
    ])
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Sign in to see your projects</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <ActivityIndicator color={colors.amber} size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>Upload a script to get started</Text>
          <Pressable style={styles.button} onPress={() => router.push('/')}>
            <Text style={styles.buttonText}>Upload Script</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => openProject(item)}
              onLongPress={() => confirmDelete(item)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.cardMeta}>
                <Text style={styles.cardLines}>
                  {item.entries.length} lines
                </Text>
                {item.selected_character && (
                  <Text style={styles.cardCharacter}>
                    as {item.selected_character}
                  </Text>
                )}
              </View>
              <Text style={styles.cardDate}>
                {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </Pressable>
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
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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
  },
  card: {
    backgroundColor: colors.stageCard,
    borderRadius: 12,
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardLines: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardCharacter: {
    fontSize: 13,
    color: colors.amber,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textDim,
  },
})
