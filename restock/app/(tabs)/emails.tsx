import { Text, View } from "react-native";
import { emailsStyles } from "../../styles/components/emails";

export default function EmailsScreen() {
  return (
    <View style={emailsStyles.container}>
      <Text style={emailsStyles.title}>Emails</Text>
      <Text style={emailsStyles.subtitle}>Manage your supplier communications</Text>
    </View>
  );
} 