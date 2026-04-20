import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../lib/auth-context'
import { FilePicker } from '../components/FilePicker'
import { SavedScriptsList } from '../components/SavedScriptsList'
import { colors, spacing } from '../theme'

export default function HomeScreen() {
  const router = useRouter()
  const { user, signOut, loading } = useAuth()

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

        <View style={styles.buttonRow}>
          {user ? (
            <>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push('/dashboard')}
              >
                <Text style={styles.secondaryButtonText}>My Projects</Text>
              </Pressable>
              <Pressable
                style={styles.authButton}
                onPress={signOut}
              >
                <Text style={styles.authButtonText}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            !loading && (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </Pressable>
            )
          )}
        </View>

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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.stageCard,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.textDim,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.cream,
  },
  authButton: {
    backgroundColor: colors.stageCard,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
})
