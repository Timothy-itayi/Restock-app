import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatProductCount } from '../utils/formatters';
import { getSessionColorTheme } from '../utils/colorUtils';
import { getRestockSessionsStyles } from '../../../../styles/components/restock-sessions';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import { FileUploadModal } from '../../../components/FileUploadModal';

interface SessionHeaderProps {
  currentSession: any | null; // Accept domain session or legacy type
  onShowSessionSelection: () => void;
  allSessionsCount?: number;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  currentSession,
  allSessionsCount = 0,
  onShowSessionSelection
}) => {
  const restockSessionsStyles = useThemedStyles(getRestockSessionsStyles);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  
  const sessionId = currentSession && typeof currentSession.toValue === 'function' 
    ? currentSession.toValue().id 
    : currentSession?.id;
  const sessionColor = sessionId ? getSessionColorTheme(sessionId) : null;
  const currentName = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().name
    : currentSession?.name;
  const createdAt = currentSession && typeof currentSession.toValue === 'function'
    ? currentSession.toValue().createdAt
    : currentSession?.createdAt;
  const productsCount = currentSession && typeof currentSession.toValue === 'function'
    ? (Array.isArray(currentSession.toValue().items) ? currentSession.toValue().items.length : 0)
    : (Array.isArray(currentSession?.products) ? currentSession.products.length : 0);

  const handleUploadFile = () => {
    setShowFileUploadModal(false);
    // TODO: Implement file upload logic
    console.log('Upload file functionality to be implemented');
  };



  return (
    <>
      {/* Session header with switcher */}
      <View style={[
        restockSessionsStyles.sessionHeader,
        sessionColor && {
          borderLeftWidth: 4,
          borderLeftColor: sessionColor.primary,
          backgroundColor: sessionColor.light
        }
      ]}>
        <View style={restockSessionsStyles.sessionHeaderLeft}>
          <View style={[restockSessionsStyles.sessionCardTitle, { flexDirection: 'row', alignItems: 'center', flex: 1 }]}>
            {sessionColor && (
              <View style={[
                restockSessionsStyles.sessionCardTitle,
                { backgroundColor: sessionColor.primary }
              ]} />
            )}
            <Text style={[restockSessionsStyles.sessionHeaderTitle, { fontSize: 14, flex: 1 }]}>
              {(currentName ? currentName + ' • ' : 'Session • ') +
                formatDate(createdAt || new Date())}
            </Text>
            
            {/* Catalog Upload Icon */}
            <TouchableOpacity
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: 'rgba(107, 127, 107, 0.1)',
                marginLeft: 8,
              }}
              onPress={() => setShowFileUploadModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="document" 
                size={32} 
                color="#6B7F6B" 
              />
            </TouchableOpacity>
          </View>
          
          {allSessionsCount > 0 && (
            <TouchableOpacity
              style={restockSessionsStyles.sessionSwitcherButton}
              onPress={onShowSessionSelection}
            >
              <Text style={restockSessionsStyles.sessionSwitcherText}>
                Switch ({allSessionsCount})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Session summary */}
      {productsCount > 0 && (
        <View style={restockSessionsStyles.sessionSummary}>
          <Text style={restockSessionsStyles.summaryText}>
            {formatProductCount(productsCount)} added • 
            Ready to generate supplier emails
          </Text>
        </View>
      )}

      {/* Start section with instructions */}
      <View style={restockSessionsStyles.addProductSection}>
        <Text style={restockSessionsStyles.addProductInstructions}>
          Walk around your store and add products that need restocking
        </Text>
      </View>

      {/* File Upload Modal */}
      <FileUploadModal
        visible={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        onUploadFile={handleUploadFile}
    
      />
    </>
  );
};