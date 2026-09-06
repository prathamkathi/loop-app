import { Alert, Platform } from "react-native";

/**
 * Universal alert utility.
 * In react-native-web, Alert.alert is an empty no-op function.
 * This helper falls back to window.alert on web so error and status
 * dialogs are visible to students and coordinators.
 */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}
