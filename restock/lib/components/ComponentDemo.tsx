import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button, Input, Card, CustomToast } from './index';
import { Ionicons } from '@expo/vector-icons';

const ComponentDemo: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [inputValue, setInputValue] = useState('');

  const showToastMessage = (type: 'success' | 'info' | 'warning' | 'error') => {
    setToastType(type);
    setShowToast(true);
  };

  const getToastConfig = () => {
    switch (toastType) {
      case 'success':
        return {
          title: 'Success!',
          message: 'Your action was completed successfully.',
        };
      case 'info':
        return {
          title: 'Information',
          message: 'Here is some helpful information for you.',
        };
      case 'warning':
        return {
          title: 'Warning',
          message: 'Please review your input before proceeding.',
        };
      case 'error':
        return {
          title: 'Error',
          message: 'Something went wrong. Please try again.',
        };
    }
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-neutral-900 mb-6">
          Component Demo
        </Text>

        {/* Buttons Section */}
        <Card title="Buttons" className="mb-6">
          <View className="space-y-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Variants</Text>
            
            <Button title="Primary Button" onPress={() => {}} fullWidth />
            <Button title="Secondary Button" variant="secondary" onPress={() => {}} fullWidth />
            <Button title="Outline Button" variant="outline" onPress={() => {}} fullWidth />
            <Button title="Ghost Button" variant="ghost" onPress={() => {}} fullWidth />
            
            <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">Sizes</Text>
            
            <View className="flex-row gap-2">
              <Button title="Small" size="sm" onPress={() => {}} />
              <Button title="Medium" size="md" onPress={() => {}} />
              <Button title="Large" size="lg" onPress={() => {}} />
            </View>
            
            <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">States</Text>
            
            <Button title="Loading Button" loading onPress={() => {}} fullWidth />
            <Button title="Disabled Button" disabled onPress={() => {}} fullWidth />
          </View>
        </Card>

        {/* Inputs Section */}
        <Card title="Inputs" className="mb-6">
          <View className="space-y-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Variants</Text>
            
            <Input
              label="Default Input"
              placeholder="Enter text here..."
              value={inputValue}
              onChangeText={setInputValue}
              fullWidth
            />
            
            <Input
              label="Filled Input"
              variant="filled"
              placeholder="Enter text here..."
              fullWidth
            />
            
            <Input
              label="Outlined Input"
              variant="outlined"
              placeholder="Enter text here..."
              fullWidth
            />
            
            <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">With Icons</Text>
            
            <Input
              label="Email Input"
              placeholder="Enter your email"
              leftIcon={<Ionicons name="mail" size={20} color="#6B7280" />}
              keyboardType="email-address"
              fullWidth
            />
            
            <Input
              label="Password Input"
              placeholder="Enter your password"
              leftIcon={<Ionicons name="lock-closed" size={20} color="#6B7280" />}
              rightIcon={<Ionicons name="eye" size={20} color="#6B7280" />}
              secureTextEntry
              fullWidth
            />
            
            <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">With Error</Text>
            
            <Input
              label="Error Input"
              placeholder="This input has an error"
              error="This field is required"
              fullWidth
            />
            
            <Input
              label="Helper Text"
              placeholder="Input with helper text"
              helperText="This is helpful information"
              fullWidth
            />
          </View>
        </Card>

        {/* Cards Section */}
        <Card title="Cards" className="mb-6">
          <View className="space-y-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Variants</Text>
            
            <Card variant="default" className="mb-3">
              <Text className="text-neutral-700">Default card with shadow</Text>
            </Card>
            
            <Card variant="elevated" className="mb-3">
              <Text className="text-neutral-700">Elevated card with stronger shadow</Text>
            </Card>
            
            <Card variant="outlined" className="mb-3">
              <Text className="text-neutral-700">Outlined card with border</Text>
            </Card>
            
            <Text className="text-sm font-medium text-neutral-700 mb-2 mt-4">With Content</Text>
            
            <Card 
              title="Card with Title" 
              subtitle="This is a subtitle"
              variant="elevated"
              className="mb-3"
            >
              <Text className="text-neutral-700">
                This card has a title, subtitle, and content. It demonstrates the full card component capabilities.
              </Text>
            </Card>
          </View>
        </Card>

        {/* Toast Demo Section */}
        <Card title="Toast Notifications" className="mb-6">
          <View className="space-y-3">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Toast Types</Text>
            
            <Button 
              title="Show Success Toast" 
              variant="outline" 
              onPress={() => showToastMessage('success')} 
              fullWidth 
            />
            
            <Button 
              title="Show Info Toast" 
              variant="outline" 
              onPress={() => showToastMessage('info')} 
              fullWidth 
            />
            
            <Button 
              title="Show Warning Toast" 
              variant="outline" 
              onPress={() => showToastMessage('warning')} 
              fullWidth 
            />
            
            <Button 
              title="Show Error Toast" 
              variant="outline" 
              onPress={() => showToastMessage('error')} 
              fullWidth 
            />
          </View>
        </Card>

        {/* Color Palette */}
        <Card title="Color Palette" className="mb-6">
          <View className="space-y-4">
            <Text className="text-sm font-medium text-neutral-700 mb-2">Sage Green Theme</Text>
            
            <View className="flex-row gap-2">
              <View className="w-12 h-12 bg-sage-50 rounded-lg border border-neutral-200" />
              <View className="w-12 h-12 bg-sage-100 rounded-lg border border-neutral-200" />
              <View className="w-12 h-12 bg-sage-200 rounded-lg border border-neutral-200" />
              <View className="w-12 h-12 bg-sage-300 rounded-lg border border-neutral-200" />
              <View className="w-12 h-12 bg-sage-400 rounded-lg border border-neutral-200" />
              <View className="w-12 h-12 bg-sage-500 rounded-lg border border-neutral-200" />
            </View>
            
            <Text className="text-sm font-medium text-neutral-700 mb-2">Status Colors</Text>
            
            <View className="flex-row gap-2">
              <View className="w-12 h-12 bg-success-500 rounded-lg" />
              <View className="w-12 h-12 bg-warning-500 rounded-lg" />
              <View className="w-12 h-12 bg-error-500 rounded-lg" />
              <View className="w-12 h-12 bg-info-500 rounded-lg" />
            </View>
          </View>
        </Card>
      </View>

      {/* Toast Component */}
      <CustomToast
        visible={showToast}
        type={toastType}
        title={getToastConfig().title}
        message={getToastConfig().message}
        autoDismiss={true}
        duration={4000}
        onDismiss={() => setShowToast(false)}
      />
    </ScrollView>
  );
};

export default ComponentDemo; 