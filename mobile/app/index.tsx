import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../lib/auth-context'
import { FilePicker } from '../components/FilePicker'
import { SavedScriptsList } from '../components/SavedScriptsList'
import { colors, spacing } from '../theme'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const handleParsed = () => {
    router.push('/review')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Line Reader</Text>
          <Text style={styles.subtitle}>Your acting rehearsal partner</Text>
        </View>

        <FilePicker onParsed={handleParsed} />

        {user && (
          <Pressable
            style={styles.dashboardButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.dashboardButtonText}>My Projects</Text>
          </Pressable>
        )}

        <SavedScriptsList onLoaded={handleParsed} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stageDeep,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  dashboardButton: {
    backgroundColor: colors.stageCard,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  dashboardButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.cream,
  },
})
