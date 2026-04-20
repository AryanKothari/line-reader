import * as Haptics from 'expo-haptics'

export function lightTap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
}

export function mediumTap(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
}

export function success(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}

export function error(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
}

export function selection(): void {
  Haptics.selectionAsync()
}
