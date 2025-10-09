import { StyleSheet } from 'react-native';
import { typography } from '../typography';
import colors from '../../lib/theme/colors';

export const loadingScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.lighter,
    padding: 20,
  },
  message: {
    marginTop: 20,
    ...typography.bodyMedium,
    color: colors.neutral.darkest,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 