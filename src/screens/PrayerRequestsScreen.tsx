import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PrayerRequest } from '../types/PrayerRequest';
import {
  createPrayerRequest,
  getPrayerRequests,
  updatePrayerRequest,
  deletePrayerRequest,
} from '../services/prayerRequestService';

export const PrayerRequestsScreen: React.FC = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as PrayerRequest['status'],
    answerNotes: '',
  });

  const navigation = useNavigation();

  const loadRequests = () => {
    try {
      const data = getPrayerRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error loading prayer requests:', error);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = () => {
    try {
      if (editingRequest) {
        updatePrayerRequest(editingRequest.id, {
          ...formData
        });
      } else {
        createPrayerRequest({
          ...formData,
          requestDate: new Date(),
          status: 'active',
        });
      }
      setModalVisible(false);
      setEditingRequest(null);
      setFormData({
        title: '',
        description: '',
        status: 'active',
        answerNotes: '',
      });
      loadRequests();
    } catch (error) {
      console.error('Error saving prayer request:', error);
    }
  };

  const handleEdit = (request: PrayerRequest) => {
    setEditingRequest(request);
    setFormData({
      title: request.title,
      description: request.description,
      status: request.status,
      answerNotes: request.answerNotes || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    try {
      deletePrayerRequest(id);
      loadRequests();
    } catch (error) {
      console.error('Error deleting prayer request:', error);
    }
  };

  const renderItem = ({ item }: { item: PrayerRequest }) => (
    <View style={styles.requestItem}>
      <View style={styles.requestHeader}>
        <Text style={styles.requestTitle}>{item.title}</Text>
        <Text style={[styles.statusBadge, styles[`status${item.status}`]]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.requestDescription}>{item.description}</Text>
      <Text style={styles.requestDate}>
        {new Date(item.requestDate).toLocaleDateString()}
      </Text>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.actionButtonText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            删除
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>添加代祷事项</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingRequest ? '编辑代祷事项' : '新增代祷事项'}
              </Text>

              <Text style={styles.label}>标题</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="请输入标题"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>描述</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="请输入描述"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {editingRequest && (
                <>
                  <Text style={styles.label}>状态</Text>
                  <View style={styles.statusButtons}>
                    {['active', 'answered', 'archived'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusButton,
                          formData.status === status && styles.statusButtonActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            status: status as PrayerRequest['status'],
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.statusButtonText,
                            formData.status === status &&
                              styles.statusButtonTextActive,
                          ]}
                        >
                          {status === 'active'
                            ? '进行中'
                            : status === 'answered'
                            ? '已应允'
                            : '已归档'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {formData.status === 'answered' && (
                    <>
                      <Text style={styles.label}>应允笔记</Text>
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.answerNotes}
                        onChangeText={(text) =>
                          setFormData({ ...formData, answerNotes: text })
                        }
                        placeholder="请输入应允笔记"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </>
                  )}
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setModalVisible(false);
                    setEditingRequest(null);
                    setFormData({
                      title: '',
                      description: '',
                      status: 'active',
                      answerNotes: '',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 12,
  },
  statusactive: {
    backgroundColor: '#E8F0FE',
    color: '#6200ee',
  },
  statusanswered: {
    backgroundColor: '#E8F5E9',
    color: '#388E3C',
  },
  statusarchived: {
    backgroundColor: '#EEEEEE',
    color: '#616161',
  },
  requestDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  requestDate: {
    fontSize: 12,
    color: '#999',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
    backgroundColor: '#E8F0FE',
  },
  actionButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FFF3F3',
  },
  deleteButtonText: {
    color: '#D32F2F',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusButton: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#E8F0FE',
    borderColor: '#6200ee',
  },
  statusButtonText: {
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#6200ee',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  cancelButtonText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 