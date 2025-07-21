import { restockSessionsStyles } from "@/styles/components/restock-sessions";
import { Text, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={restockSessionsStyles.container}>
      <Text style={restockSessionsStyles.title}>Profile</Text>
      <Text style={restockSessionsStyles.subtitle}>Manage your profile</Text>
    </View>
  );
} 