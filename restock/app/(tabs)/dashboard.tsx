import { Text, View } from "react-native";
import { dashboardStyles } from "../../styles/components/dashboard";

export default function DashboardScreen() {
  return (
    <View style={dashboardStyles.container}>
      <Text style={dashboardStyles.title}>Dashboard</Text>
      <Text style={dashboardStyles.subtitle}>Welcome to your restocking dashboard</Text>
    </View>
  );
} 