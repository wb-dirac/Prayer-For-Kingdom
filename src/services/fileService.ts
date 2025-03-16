import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { ExportData, Prayer } from '../types';
import { getAllPrayers, importData } from './database';

// 导出数据到文件
export const exportDataToFile = async (): Promise<void> => {
  try {
    // 获取所有祷告记录
    const prayers = getAllPrayers();
    
    // 创建导出数据对象
    const exportData: ExportData = {
      prayers,
      version: '1.0',
      exportDate: Date.now()
    };
    
    // 将数据转换为JSON字符串
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // 创建临时文件
    const fileUri = `${FileSystem.documentDirectory}prayer_data_${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonData);
    
    // 分享文件
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: '导出祷告数据',
        UTI: 'public.json'
      });
    } else {
      throw new Error('分享功能不可用');
    }
  } catch (error) {
    console.error('导出数据失败:', error);
    throw error;
  }
};

// 从文件导入数据
export const importDataFromFile = async (): Promise<void> => {
  try {
    // 选择文件
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true
    });
    
    if (result.canceled) {
      throw new Error('用户取消了文件选择');
    }
    
    // 读取文件内容
    const fileUri = result.assets[0].uri;
    const jsonData = await FileSystem.readAsStringAsync(fileUri);
    
    // 解析JSON数据
    const importedData = JSON.parse(jsonData) as ExportData;
    
    // 验证数据格式
    if (!importedData.prayers || !Array.isArray(importedData.prayers)) {
      throw new Error('无效的数据格式');
    }
    
    // 导入数据到数据库
    importData(importedData.prayers);
    
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
}; 