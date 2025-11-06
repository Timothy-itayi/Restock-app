import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect away from a blank root route; AuthRouter will further gate as needed
  return <Redirect href="/welcome" />;
}
