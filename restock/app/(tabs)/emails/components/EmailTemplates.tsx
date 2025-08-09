import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmailDraft } from '../hooks';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  usage: number;
}

interface EmailTemplatesProps {
  recentEmails: EmailDraft[];
  onUseTemplate: (template: EmailTemplate) => void;
}

export const EmailTemplates: React.FC<EmailTemplatesProps> = ({
  recentEmails,
  onUseTemplate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate templates from recent emails
  const generateTemplates = (): EmailTemplate[] => {
    const templates: EmailTemplate[] = [];
    
    // Default templates
    templates.push({
      id: 'default-restock',
      name: 'Standard Restock Order',
      subject: 'Restock Order Request',
      body: `Hi team,\n\nWe hope you're doing well! We'd like to place a restock order for the following items:\n\n[PRODUCT_LIST]\n\nPlease confirm availability at your earliest convenience.\n\nThank you as always for your continued support.\n\nBest regards,\n[STORE_NAME]\n[STORE_EMAIL]`,
      usage: 0
    });

    templates.push({
      id: 'urgent-restock',
      name: 'Urgent Restock Request',
      subject: 'URGENT: Restock Order Needed',
      body: `Hi team,\n\nWe urgently need to restock the following items due to high customer demand:\n\n[PRODUCT_LIST]\n\nCould you please expedite this order? We'd appreciate your fastest processing time.\n\nPlease confirm availability and delivery timeline.\n\nThank you for your quick attention to this matter.\n\nBest regards,\n[STORE_NAME]\n[STORE_EMAIL]`,
      usage: 0
    });

    // Generate templates from recent successful emails
    const emailPatterns: { [key: string]: { count: number, example: EmailDraft } } = {};
    
    recentEmails
      .filter(email => email.status === 'sent')
      .forEach(email => {
        // Create a pattern based on subject structure
        const subjectPattern = email.subject
          .replace(/[A-Z][a-z]+ [A-Z][a-z]+/g, '[STORE_NAME]') // Replace store names
          .replace(/\d+/g, 'X'); // Replace numbers
        
        if (emailPatterns[subjectPattern]) {
          emailPatterns[subjectPattern].count++;
        } else {
          emailPatterns[subjectPattern] = { count: 1, example: email };
        }
      });

    // Add frequently used patterns as templates
    Object.entries(emailPatterns)
      .filter(([, data]) => data.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .forEach(([pattern, data], index) => {
        templates.push({
          id: `pattern-${index}`,
          name: `Frequent Pattern #${index + 1}`,
          subject: pattern,
          body: data.example.body
            .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[STORE_NAME]')
            .replace(/[a-z]+@[a-z]+\.[a-z]+/g, '[STORE_EMAIL]'),
          usage: data.count
        });
      });

    return templates;
  };

  const templates = generateTemplates();

  const handleUseTemplate = (template: EmailTemplate) => {
    Alert.alert(
      'Use Template',
      `Use "${template.name}" as the starting point for new emails?\n\nYou can customize the template after applying it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Template',
          onPress: () => onUseTemplate(template)
        }
      ]
    );
  };

  if (templates.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.headerContent}>
          <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Email Templates</Text>
          {templates.length > 2 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{templates.length}</Text>
            </View>
          )}
        </View>
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#6B7280" 
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView style={styles.templatesList} showsVerticalScrollIndicator={false}>
          {templates.map((template, index) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                { borderLeftColor: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#8B5CF6' }
              ]}
              onPress={() => handleUseTemplate(template)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateName}>{template.name}</Text>
                {template.usage > 0 && (
                  <View style={styles.usageBadge}>
                    <Text style={styles.usageText}>{template.usage}x</Text>
                  </View>
                )}
              </View>
              <Text style={styles.templateSubject} numberOfLines={1}>
                {template.subject}
              </Text>
              <Text style={styles.templatePreview} numberOfLines={2}>
                {template.body}
              </Text>
              <View style={styles.templateActions}>
                <Text style={styles.useText}>Tap to use</Text>
                <Ionicons name="arrow-forward" size={14} color="#8B5CF6" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  templatesList: {
    maxHeight: 300,
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#FEFEFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  usageBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  usageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  templateSubject: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 4,
  },
  templatePreview: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  templateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  useText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginRight: 4,
  },
});