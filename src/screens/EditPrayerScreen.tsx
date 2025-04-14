import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { usePrayer } from '../contexts/PrayerContext';
import { formatTime, formatDuration } from '../utils/timeUtils';
import DateTimePicker from '@react-native-community/datetimepicker';

type EditPrayerScreenRouteProp = RouteProp<RootStackParamList, 'EditPrayer'>;
type EditPrayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditPrayer'>;

const EditPrayerScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<EditPrayerScreenRouteProp>();
  const { updatePrayer, addPrayer } = usePrayer();
  const originalPrayer = route.params?.prayer;

  const [title, setTitle] = useState(originalPrayer?.title || '');
  const [notes, setNotes] = useState(originalPrayer?.notes || '');
  const [startTime, setStartTime] = useState(originalPrayer?.startTime || new Date().setHours(9, 0, 0, 0));
  const [endTime, setEndTime] = useState(originalPrayer?.endTime || new Date().setHours(10, 0, 0, 0));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  const handleDateChange = (newDate: Date) => {
    const currentStartTime = new Date(startTime);
    const currentEndTime = new Date(endTime);
    
    const newStartTime = new Date(newDate);
    newStartTime.setHours(currentStartTime.getHours());
    newStartTime.setMinutes(currentStartTime.getMinutes());
    
    const newEndTime = new Date(newDate);
    newEndTime.setHours(currentEndTime.getHours());
    newEndTime.setMinutes(currentEndTime.getMinutes());
    
    setStartTime(newStartTime.getTime());
    setEndTime(newEndTime.getTime());
    setSelectedDate(newDate);
  };

  const TimePickerModal = ({ isVisible, onClose, currentTime, onConfirm }: {
    isVisible: boolean;
    onClose: () => void;
    currentTime: number;
    onConfirm: (time: number) => void;
  }) => {
    if (!isVisible) return null;

    return Platform.OS === 'ios' ? (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelButton}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  onConfirm(tempTime.getTime());
                  onClose();
                }}
              >
                <Text style={styles.confirmButton}>确定</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempTime}
              mode="time"
              is24Hour={true}
              display="clock"
              onChange={(event, selectedDate?: Date) => {
                if (selectedDate) {
                  setTempTime(selectedDate);
                }
              }}
              style={styles.picker}
            />
          </View>
        </View>
      </Modal>
    ) : (
      <DateTimePicker
        value={new Date(currentTime)}
        mode="time"
        is24Hour={true}
        display="clock"
        onChange={(event, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            onConfirm(selectedDate.getTime());
          }
          onClose();
        }}
      />
    );
  };

  const DatePickerModal = ({ isVisible, onClose, currentDate, onConfirm }: {
    isVisible: boolean;
    onClose: () => void;
    currentDate: Date;
    onConfirm: (date: Date) => void;
  }) => {
    if (!isVisible) return null;

    return Platform.OS === 'ios' ? (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancelButton}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  onConfirm(new Date(currentDate));
                  onClose();
                }}
              >
                <Text style={styles.confirmButton}>确定</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={currentDate}
              mode="date"
              display="calendar"
              onChange={(event, selectedDate?: Date) => {
                if (selectedDate) {
                  onConfirm(selectedDate);
                }
              }}
              style={styles.picker}
              minimumDate={new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)}
              maximumDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)}
            />
          </View>
        </View>
      </Modal>
    ) : (
      <DateTimePicker
        value={currentDate}
        mode="date"
        display="calendar"
        onChange={(event, selectedDate?: Date) => {
          if (event.type === 'set' && selectedDate) {
            onConfirm(selectedDate);
          }
          onClose();
        }}
        minimumDate={new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)}
        maximumDate={new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)}
      />
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('提示', '请输入祷告主题');
      return;
    }

    try {
      if (originalPrayer) {
        await updatePrayer({
          ...originalPrayer,
          title: title.trim(),
          notes: notes.trim(),
          startTime,
          endTime,
        });
      } else {
        await addPrayer({
          title: title.trim(),
          notes: notes.trim(),
          startTime,
          endTime,
          type: 'DAILY', // Default type
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>标题</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="请输入祷告标题"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>日期和时间</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonLabel}>日期</Text>
              <Text style={styles.dateText}>{formatDate(new Date(selectedDate))}</Text>
            </TouchableOpacity>

            <View style={styles.timeContainer}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => {
                  setTempTime(new Date(startTime));
                  setShowStartTimePicker(true);
                }}
              >
                <Text style={styles.timeButtonLabel}>开始时间</Text>
                <Text style={styles.timeText}>{formatTime(new Date(startTime))}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => {
                  setTempTime(new Date(endTime));
                  setShowEndTimePicker(true);
                }}
              >
                <Text style={styles.timeButtonLabel}>结束时间</Text>
                <Text style={styles.timeText}>{formatTime(new Date(endTime))}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.durationText}>
              祷告时长: {formatDuration(endTime - startTime)}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>备注</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="添加备注（可选）"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      <TimePickerModal
        isVisible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        currentTime={startTime}
        onConfirm={setStartTime}
      />

      <TimePickerModal
        isVisible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        currentTime={endTime}
        onConfirm={setEndTime}
      />

      {showDatePicker && (
        <DatePickerModal
          isVisible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          currentDate={selectedDate}
          onConfirm={handleDateChange}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>保存修改</Text>
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
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  timeButtonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  dateButtonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#6200ee',
  },
  picker: {
    height: 216,
  },
  cancelButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  confirmButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPrayerScreen; 