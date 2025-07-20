import { Text, View } from "react-native";
import { restockSessionsStyles } from "../../styles/components/restock-sessions";

export default function RestockSessionsScreen() {
  return (
    <View style={restockSessionsStyles.container}>
      <Text style={restockSessionsStyles.title}>Restock Sessions</Text>
      <Text style={restockSessionsStyles.subtitle}>Manage your restock sessions</Text>
    </View>
  );
} 