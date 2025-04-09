import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { PrayerType } from '../types';
import { PrayerRequest } from '../types/PrayerRequest';
import { getPrayerRequests } from '../services/prayerRequestService';

type NewPrayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewPrayer'>;

const NewPrayerScreen = () => {
  const navigation = useNavigation<NewPrayerScreenNavigationProp>();
  const { startPrayer } = usePrayer();
  
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PrayerType>(PrayerType.DAILY);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<number[]>([]);

  useEffect(() => {
    // 加载活跃的代祷事项
    try {
      const requests = getPrayerRequests('active');
      setPrayerRequests(requests);
    } catch (error) {
      console.error('加载代祷事项失败:', error);
    }
  }, []);

  // 处理开始祷告
  const handleStartPrayer = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '请输入祷告主题');
      return;
    }

    try {
      setIsSubmitting(true);
      // 将选中的代祷事项ID和内容添加到备注中
      let finalNotes = notes.trim();
      if (selectedRequestIds.length > 0) {
        const selectedRequests = prayerRequests.filter(req => selectedRequestIds.includes(req.id));
        const requestsText = selectedRequests
          .map(req => `- ${req.title}`)
          .join('\\n');
        finalNotes = `${finalNotes}\\n\\n代祷事项：\\n${requestsText}`;
      }
      await startPrayer(title.trim(), type, finalNotes);
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '开始祷告失败，请重试');
      console.error('开始祷告失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 处理代祷事项选择
  const toggleRequestSelection = (requestId: number) => {
    setSelectedRequestIds(prev => 
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
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

  // 渲染代祷事项
  const renderPrayerRequest = ({ item }: { item: PrayerRequest }) => (
    <TouchableOpacity
      style={[
        styles.requestItem,
        selectedRequestIds.includes(item.id) && styles.requestItemSelected
      ]}
      onPress={() => toggleRequestSelection(item.id)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        {selectedRequestIds.includes(item.id) && (
          <Ionicons name="checkmark-circle" size={20} color="#6200ee" />
        )}
      </View>
      <Text style={styles.requestDescription} numberOfLines={2}>
        {item.description}
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

          {/* 代祷事项 */}
          {prayerRequests.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>选择代祷事项</Text>
              <FlatList
                data={prayerRequests}
                renderItem={renderPrayerRequest}
                keyExtractor={item => item.id.toString()}
                scrollEnabled={false}
                style={styles.requestsList}
              />
            </View>
          )}

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
          style={[
            styles.startButton,
            (!title.trim() || isSubmitting) && styles.startButtonDisabled
          ]}
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
  requestsList: {
    marginTop: 8,
  },
  requestItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  requestItemSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  startButtonDisabled: {
    backgroundColor: '#e0e0e0',
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