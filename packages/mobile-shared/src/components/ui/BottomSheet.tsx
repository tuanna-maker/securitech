import { Modal, View, Pressable, StyleSheet, Platform } from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { radii, spacing } from "../../design/layout";

export function BottomSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.groupedBackground, borderTopLeftRadius: Platform.OS === "ios" ? 12 : 28, borderTopRightRadius: Platform.OS === "ios" ? 12 : 28 }]}>
        {Platform.OS === "ios" ? <View style={[styles.grabber, { backgroundColor: colors.separator }]} /> : null}
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { paddingTop: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.section, maxHeight: "85%" },
  grabber: { width: 36, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: spacing.md },
});
