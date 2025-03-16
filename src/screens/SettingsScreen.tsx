import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePrayer } from '../contexts/PrayerContext';

const SettingsScreen = () => {
  const { exportData, importData } = usePrayer();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // 处理导出数据
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportData();
      Alert.alert('成功', '数据导出成功');
    } catch (error) {
      console.error('导出数据失败:', error);
      Alert.alert('错误', '导出数据失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 处理导入数据
  const handleImportData = async () => {
    try {
      Alert.alert(
        '导入数据',
        '导入将覆盖当前所有数据，确定要继续吗？',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '确定',
            onPress: async () => {
              try {
                setIsImporting(true);
                await importData();
                Alert.alert('成功', '数据导入成功');
              } catch (error) {
                console.error('导入数据失败:', error);
                Alert.alert('错误', '导入数据失败，请重试');
              } finally {
                setIsImporting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('导入数据失败:', error);
      Alert.alert('错误', '导入数据失败，请重试');
    }
  };

  // 处理关于应用
  const handleAbout = () => {
    Alert.alert(
      '关于祷告王国',
      '祷告王国 v1.0.0\n\n一个帮助您记录和统计祷告时间的应用。\n\n© 2023 祷告王国团队'
    );
  };

  // 处理反馈
  const handleFeedback = () => {
    Linking.openURL('mailto:feedback@prayerkingdom.com?subject=祷告王国反馈');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleExportData}
          disabled={isExporting}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="cloud-upload-outline" size={24} color="#6200ee" style={styles.settingItemIcon} />
            <View>
              <Text style={styles.settingItemTitle}>导出数据</Text>
              <Text style={styles.settingItemDescription}>将祷告记录导出为文件</Text>
            </View>
          </View>
          {isExporting ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#999" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleImportData}
          disabled={isImporting}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="cloud-download-outline" size={24} color="#6200ee" style={styles.settingItemIcon} />
            <View>
              <Text style={styles.settingItemTitle}>导入数据</Text>
              <Text style={styles.settingItemDescription}>从文件导入祷告记录</Text>
            </View>
          </View>
          {isImporting ? (
            <ActivityIndicator size="small" color="#6200ee" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#999" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleAbout}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="information-circle-outline" size={24} color="#6200ee" style={styles.settingItemIcon} />
            <View>
              <Text style={styles.settingItemTitle}>关于应用</Text>
              <Text style={styles.settingItemDescription}>版本信息和开发者</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleFeedback}
        >
          <View style={styles.settingItemContent}>
            <Ionicons name="mail-outline" size={24} color="#6200ee" style={styles.settingItemIcon} />
            <View>
              <Text style={styles.settingItemTitle}>反馈</Text>
              <Text style={styles.settingItemDescription}>发送反馈或报告问题</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingItemIcon: {
    marginRight: 16,
  },
  settingItemTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingItemDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default SettingsScreen; 