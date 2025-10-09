import { StyleSheet } from 'react-native';
import { typography } from '../typography';
import colors from '../../lib/theme/colors';

export const signOutButtonStyles = StyleSheet.create({
  button: {
    backgroundColor: colors.status.error,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonText: {
    ...typography.buttonText,
    color: colors.neutral.lightest,
    fontWeight: '600',
  },
}); 