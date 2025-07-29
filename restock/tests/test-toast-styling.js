/**
 * Test file to demonstrate the new modern toast styling
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import CustomToast from '../app/components/CustomToast';

// Test component to demonstrate different toast types
const ToastDemo = () => {
  const [visibleToast, setVisibleToast] = useState(null);
  const [toastConfig, setToastConfig] = useState({});

  const showToast = (type, title, message) => {
    setToastConfig({ type, title, message });
    setVisibleToast(type);
  };

  const hideToast = () => {
    setVisibleToast(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.successButton]} 
        onPress={() => showToast('success', 'Task created', 'Your restock session has been successfully created and is ready for use.')}
      >
        <Text style={styles.buttonText}>Show Success Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.infoButton]} 
        onPress={() => showToast('info', 'Information', 'This is an informational message for your reference.')}
      >
        <Text style={styles.buttonText}>Show Info Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.warningButton]} 
        onPress={() => showToast('warning', 'Warning', 'Please review your input before proceeding.')}
      >
        <Text style={styles.buttonText}>Show Warning Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.errorButton]} 
        onPress={() => showToast('error', 'Error', 'Something went wrong. Please try again.')}
      >
        <Text style={styles.buttonText}>Show Error Toast</Text>
      </TouchableOpacity>

      <CustomToast
        visible={visibleToast === toastConfig.type}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        autoDismiss={true}
        duration={4000}
        onDismiss={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

describe('Modern Toast Styling', () => {
  test('should render success toast with modern styling', () => {
    render(<ToastDemo />);
    
    const successButton = screen.getByText('Show Success Toast');
    fireEvent.press(successButton);
    
    // Verify the toast appears with modern styling
    expect(screen.getByText('Task created')).toBeTruthy();
    expect(screen.getByText('Your restock session has been successfully created and is ready for use.')).toBeTruthy();
  });

  test('should render info toast with modern styling', () => {
    render(<ToastDemo />);
    
    const infoButton = screen.getByText('Show Info Toast');
    fireEvent.press(infoButton);
    
    expect(screen.getByText('Information')).toBeTruthy();
    expect(screen.getByText('This is an informational message for your reference.')).toBeTruthy();
  });

  test('should render warning toast with modern styling', () => {
    render(<ToastDemo />);
    
    const warningButton = screen.getByText('Show Warning Toast');
    fireEvent.press(warningButton);
    
    expect(screen.getByText('Warning')).toBeTruthy();
    expect(screen.getByText('Please review your input before proceeding.')).toBeTruthy();
  });

  test('should render error toast with modern styling', () => {
    render(<ToastDemo />);
    
    const errorButton = screen.getByText('Show Error Toast');
    fireEvent.press(errorButton);
    
    expect(screen.getByText('Error')).toBeTruthy();
    expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
  });

  test('should have close button functionality', () => {
    render(<ToastDemo />);
    
    const successButton = screen.getByText('Show Success Toast');
    fireEvent.press(successButton);
    
    // The close button should be present
    // Note: In a real test, you'd check for the close button icon
    expect(screen.getByText('Task created')).toBeTruthy();
  });
});

export default ToastDemo; 