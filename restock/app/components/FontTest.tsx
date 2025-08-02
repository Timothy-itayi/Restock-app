import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export const FontTest: React.FC = () => {
  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Text style={{ fontFamily: 'Satoshi-Black', fontSize: 24, marginBottom: 10 }}>
        Satoshi Black - App Title
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-Bold', fontSize: 20, marginBottom: 10 }}>
        Satoshi Bold - Section Header
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-Medium', fontSize: 16, marginBottom: 10 }}>
        Satoshi Medium - Product Names & Buttons
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-Regular', fontSize: 16, marginBottom: 10 }}>
        Satoshi Regular - Body Text
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-Light', fontSize: 14, marginBottom: 10 }}>
        Satoshi Light - Captions & Metadata
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-Italic', fontSize: 16, marginBottom: 10, fontStyle: 'italic' }}>
        Satoshi Italic - Emphasis & Notes
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-LightItalic', fontSize: 12, marginBottom: 10, fontStyle: 'italic' }}>
        Satoshi Light Italic - Subtle Emphasis
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-MediumItalic', fontSize: 14, marginBottom: 10, fontStyle: 'italic' }}>
        Satoshi Medium Italic - Medium Emphasis
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-BoldItalic', fontSize: 18, marginBottom: 10, fontStyle: 'italic' }}>
        Satoshi Bold Italic - Strong Emphasis
      </Text>
      
      <Text style={{ fontFamily: 'Satoshi-BlackItalic', fontSize: 22, marginBottom: 10, fontStyle: 'italic' }}>
        Satoshi Black Italic - Maximum Emphasis
      </Text>
    </ScrollView>
  );
};

export default FontTest; 