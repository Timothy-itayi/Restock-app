import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SessionService } from '../../../../backend/services/sessions';
import { getSessionColorTheme } from '../utils/colorUtils';
import { RestockSession } from '../utils/types';

interface ReplaySession {
  id: string;
  createdAt: Date;
  productCount: number;
  supplierCount: number;
  products: any[];
  frequency: number; // How many times this pattern has been used
}

interface ReplaySuggestionsProps {
  userId?: string;
  onReplaySession: (session: ReplaySession) => void;
  currentSession?: RestockSession | null;
}

export const ReplaySuggestions: React.FC<ReplaySuggestionsProps> = ({
  userId,
  onReplaySession,
  currentSession
}) => {
  const [suggestions, setSuggestions] = useState<ReplaySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const run = async () => {
      await loadReplaySuggestions(controller, isMounted);
    };
    run();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [userId, currentSession]);

  const loadReplaySuggestions = async (controller?: AbortController, isMounted: boolean = true) => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Get all completed sessions
      const result = await SessionService.getUserSessions(userId);
      
      if (!controller?.signal.aborted && isMounted && result.data && result.data.length > 0) {
        // Analyze sessions to find patterns
        const sessionPatterns = analyzeSessionPatterns(result.data);
        
        // Filter and sort suggestions
        const filteredSuggestions = sessionPatterns
          .filter(pattern => pattern.frequency >= 2) // Only suggest if used 2+ times
          .sort((a, b) => b.frequency - a.frequency) // Most frequent first
          .slice(0, 3); // Top 3 suggestions
        
        setSuggestions(filteredSuggestions);
        setIsVisible(filteredSuggestions.length > 0);
      }
    } catch (error) {
      console.error('Error loading replay suggestions:', error);
    } finally {
      if (!controller?.signal.aborted && isMounted) setLoading(false);
    }
  };

  const analyzeSessionPatterns = (sessions: any[]): ReplaySession[] => {
    const patterns: { [key: string]: ReplaySession } = {};
    
    sessions.forEach((session) => {
      if (session.status === 'completed' && session.products?.length > 0) {
        // Create a pattern key based on products and suppliers
        const productNames = session.products
          .map((p: any) => p.name?.toLowerCase())
          .sort()
          .join('|');
        
        const supplierNames = Array.from(
          new Set(session.products.map((p: any) => p.supplierName?.toLowerCase()))
        ).sort().join('|');
        
        const patternKey = `${productNames}::${supplierNames}`;
        
        if (patterns[patternKey]) {
          patterns[patternKey].frequency++;
          // Update to most recent session data
          if (new Date(session.created_at || session.createdAt) > patterns[patternKey].createdAt) {
            patterns[patternKey].createdAt = new Date(session.created_at || session.createdAt);
            patterns[patternKey].products = session.products;
          }
        } else {
          patterns[patternKey] = {
            id: session.id,
            createdAt: new Date(session.created_at || session.createdAt),
            productCount: session.products.length,
            supplierCount: new Set(session.products.map((p: any) => p.supplierName)).size,
            products: session.products,
            frequency: 1
          };
        }
      }
    });
    
    return Object.values(patterns);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const handleReplay = (suggestion: ReplaySession) => {
    Alert.alert(
      'Replay Session',
      `Replay this restock pattern with ${suggestion.productCount} products from ${suggestion.supplierCount} suppliers?\n\nUsed ${suggestion.frequency} times before.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replay',
          onPress: () => onReplaySession(suggestion)
        }
      ]
    );
  };

  if (loading || !isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="refresh-circle" size={20} color="#10B981" />
          <Text style={styles.headerTitle}>Suggested Replays</Text>
        </View>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => setIsVisible(false)}
        >
          <Ionicons name="close" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion, index) => {
          const sessionColor = getSessionColorTheme(suggestion.id, index);
          
          return (
            <TouchableOpacity
              key={suggestion.id}
              style={[
                styles.suggestionCard,
                {
                  borderColor: sessionColor.primary,
                  backgroundColor: sessionColor.secondary
                }
              ]}
              onPress={() => handleReplay(suggestion)}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.frequencyBadge,
                  { backgroundColor: sessionColor.primary }
                ]}>
                  <Text style={styles.frequencyText}>
                    {suggestion.frequency}x
                  </Text>
                </View>
                <Ionicons name="reload" size={16} color={sessionColor.primary} />
              </View>
              
              <Text style={styles.cardTitle}>
                {suggestion.productCount} products
              </Text>
              <Text style={styles.cardSubtitle}>
                {suggestion.supplierCount} suppliers
              </Text>
              <Text style={styles.cardDate}>
                Last used {formatDate(suggestion.createdAt)}
              </Text>
              
              <View style={styles.productPreview}>
                <Text style={styles.productPreviewText} numberOfLines={2}>
                  {suggestion.products
                    .slice(0, 3)
                    .map(p => p.name)
                    .join(', ')}
                  {suggestion.products.length > 3 && '...'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  dismissButton: {
    padding: 4,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 12,
  },
  suggestionCard: {
    width: 180,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  productPreview: {
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
    minHeight: 28,
  },
  productPreviewText: {
    fontSize: 11,
    color: '#6B7280',
  },
});