import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import colors, { spacing, fontSize } from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>This screen does not exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: "700" as const,
    color: colors.text,
    textAlign: "center",
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkText: {
    fontSize: fontSize.body,
    color: colors.primary,
    fontWeight: "600" as const,
  },
});
