import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { getDashboardStyles } from '../../../styles/components/dashboard';
import SkeletonBox  from '../../components/skeleton/SkeletonBox';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { AppColors } from '../../theme/colors';

interface Session {
  id: string;
  createdAt: string;
  status: string;
  totalItems: number;
  totalQuantity: number;
  uniqueSuppliers: number;
  uniqueProducts: number;
  items: any[];
}

interface StatsOverviewEnhancedProps {
  sessionsLoading: boolean;
  unfinishedSessions: Session[];
  finishedSessions: Session[];
}

const DonutChart: React.FC<{
  activeCount: number;
  finishedCount: number;
  size: number;
  appTheme: any;
}> = ({ activeCount, finishedCount, size, appTheme }) => {
  const total = activeCount + finishedCount;
  if (total === 0) return null;

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const activePercentage = (activeCount / total) * 100;
  const finishedPercentage = (finishedCount / total) * 100;
  
  // Calculate stroke dash arrays for the segments
  const activeStroke = (activePercentage / 100) * circumference;
  const finishedStroke = (finishedPercentage / 100) * circumference;
  const gap = 2; // Small gap between segments
  
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={appTheme.colors.neutral.light}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Active sessions segment */}
        {activeCount > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={appTheme.colors.status.info}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${activeStroke - gap} ${circumference - activeStroke + gap}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        
        {/* Finished sessions segment */}
        {finishedCount > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={appTheme.colors.status.success}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${finishedStroke - gap} ${circumference - finishedStroke + gap}`}
            strokeDashoffset={-(activeStroke)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        
        {/* Center text */}
        <SvgText
          x={size / 2}
          y={size / 2 - 8}
          textAnchor="middle"
          fontSize="20"
          fontWeight="600"
          fill={appTheme.colors.neutral.darkest}
        >
          {total}
        </SvgText>
        <SvgText
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          fontSize="12"
          fill={appTheme.colors.neutral.medium}
        >
          Sessions
        </SvgText>
      </Svg>
    </View>
  );
};

export const StatsOverviewEnhanced: React.FC<StatsOverviewEnhancedProps> = ({
  sessionsLoading,
  unfinishedSessions,
  finishedSessions
}) => {
  const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);

  const allSessions = [...unfinishedSessions, ...finishedSessions];
  const totalProducts = allSessions.reduce((sum, session) => sum + session.uniqueProducts, 0);
  const totalSuppliers = allSessions.reduce((sum, session) => sum + session.uniqueSuppliers, 0);

  return (
    <View style={dashboardStyles.section}>
      <Text style={dashboardStyles.sectionTitle}>Overview</Text>
      
      {sessionsLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <SkeletonBox width={120} height={120} borderRadius={60} />
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 24 }}>
            <SkeletonBox width={60} height={40} borderRadius={8} />
            <SkeletonBox width={60} height={40} borderRadius={8} />
            <SkeletonBox width={60} height={40} borderRadius={8} />
          </View>
        </View>
      ) : allSessions.length === 0 ? (
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: colors.neutral.lighter,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.neutral.light,
            borderStyle: 'dashed'
          }}>
            <Text style={{ fontSize: 16, color: colors.neutral.medium, fontWeight: '500' }}>No Data</Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.neutral.medium, marginTop: 12 }}>
            Start your first restock session
          </Text>
        </View>
      ) : (
        <>
          {/* Donut Chart */}
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <DonutChart
              activeCount={unfinishedSessions.length}
              finishedCount={finishedSessions.length}
              size={120}
              appTheme={colors}
            />
            
            {/* Legend */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: 16, 
              gap: 20 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.status.info,
                  marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: colors.neutral.medium }}>
                  {unfinishedSessions.length} Active
                </Text>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.status.success,
                  marginRight: 6
                }} />
                <Text style={{ fontSize: 12, color: colors.neutral.medium }}>
                  {finishedSessions.length} Finished
                </Text>
              </View>
            </View>
          </View>
          
          {/* Metrics Row */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 16,
            borderTopWidth: 1,
              borderTopColor: colors.neutral.light
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.neutral.darkest }}>
                {allSessions.length}
              </Text>
              <Text style={{ fontSize: 11, color: colors.neutral.medium, marginTop: 2 }}>
                Total Sessions
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.neutral.darkest }}>
                {totalProducts}
              </Text>
              <Text style={{ fontSize: 11, color: colors.neutral.medium, marginTop: 2 }}>
                Products
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.neutral.darkest }}>
                {totalSuppliers}
              </Text>
              <Text style={{ fontSize: 11, color: colors.neutral.medium, marginTop: 2 }}>
                Suppliers
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};