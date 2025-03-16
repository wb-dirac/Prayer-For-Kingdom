import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { PrayerType } from '../types';

type NewPrayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewPrayer'>;

const NewPrayerScreen = () => {
  const navigation = useNavigation<NewPrayerScreenNavigationProp>();
  const { startPrayer } = usePrayer();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PrayerType>(PrayerType.DAILY);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 处理开始祷告
  const handleStartPrayer = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '请输入祷告主题');
      return;
    }

    try {
      setIsSubmitting(true);
      await startPrayer(title.trim(), type, notes.trim());
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '开始祷告失败，请重试');
      console.error('开始祷告失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染祷告类型选择按钮
  const renderTypeButton = (prayerType: PrayerType, label: string) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        type === prayerType && styles.typeButtonActive
      ]}
      onPress={() => setType(prayerType)}
    >
      <Text
        style={[
          styles.typeButtonText,
          type === prayerType && styles.typeButtonTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* 祷告主题 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>祷告主题</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="请输入祷告主题"
              placeholderTextColor="#999"
              maxLength={50}
            />
          </View>

          {/* 祷告类型 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>祷告类型</Text>
            <View style={styles.typeButtonsContainer}>
              {renderTypeButton(PrayerType.DAILY, '日常祷告')}
              {renderTypeButton(PrayerType.WEEKEND, '周末祷告')}
              {renderTypeButton(PrayerType.FASTING, '禁食祷告')}
              {renderTypeButton(PrayerType.OTHER, '其他')}
            </View>
          </View>

          {/* 备注 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>备注（可选）</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="请输入备注信息"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPrayer}
          disabled={isSubmitting || !title.trim()}
        >
          <Text style={styles.startButtonText}>开始祷告</Text>
          <Ionicons name="arrow-forward" size={16} color="white" style={styles.startButtonIcon} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  typeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButtonIcon: {
    marginLeft: 8,
  },
});

export default NewPrayerScreen; 