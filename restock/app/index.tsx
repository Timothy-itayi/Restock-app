import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { indexStyles } from "../styles/components/index";

export default function Index() {
  const navigateToTabs = () => {
    router.push("/(tabs)/dashboard");
  };

  return (
    <View style={indexStyles.container}>
      <Text style={indexStyles.title}>Welcome to Restock</Text>
      <Text style={indexStyles.subtitle}>Your inventory management solution</Text>
      
      <TouchableOpacity style={indexStyles.button} onPress={navigateToTabs}>
        <Text style={indexStyles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
