import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModelInfo } from './types';

export class ModelManager {
  private static instance: ModelManager;
  private models: Map<string, ModelInfo> = new Map();
  private downloadPath: string;

  private constructor() {
    this.downloadPath = `${FileSystem.documentDirectory}ai-models/`;
    this.initializeModels();
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private initializeModels() {
    // Phi-3 Mini model
    this.models.set('phi-3-mini', {
      name: 'Phi-3 Mini (3.8B)',
      size: 2400, // ~2.4GB quantized
      downloadUrl: 'https://huggingface.co/microsoft/Phi-3-mini-4k-instruct',
      isDownloaded: false,
      lastUsed: null,
      performance: {
        avgGenerationTime: 2000, // 2 seconds
        successRate: 0.95
      }
    });

    this.models.set('phi-2', {
      name: 'Phi-2 (2.7B)',
      size: 1800, // ~1.8GB quantized
      downloadUrl: 'https://huggingface.co/microsoft/phi-2/resolve/main/model.onnx',
      isDownloaded: false,
      lastUsed: null,
      performance: {
        avgGenerationTime: 1500, // 1.5 seconds
        successRate: 0.92
      }
    });

    this.models.set('tiny-llama', {
      name: 'TinyLlama (1.1B)',
      size: 800, // ~800MB quantized
      downloadUrl: 'https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/model.onnx',
      isDownloaded: false,
      lastUsed: null,
      performance: {
        avgGenerationTime: 800, // 0.8 seconds
        successRate: 0.88
      }
    });
  }

  async ensureModelDownloaded(modelKey: string = 'phi-3-mini'): Promise<boolean> {
    const model = this.models.get(modelKey);
    if (!model) {
      throw new Error(`Model ${modelKey} not found`);
    }

    // Check if already downloaded
    if (await this.isModelDownloaded(modelKey)) {
      model.isDownloaded = true;
      return true;
    }

    // Check available storage
    const availableSpace = await this.getAvailableStorage();
    if (availableSpace < model.size) {
      throw new Error(`Insufficient storage. Need ${model.size}MB, available ${availableSpace}MB`);
    }

    // Download model
    return await this.downloadModel(modelKey);
  }

  private async isModelDownloaded(modelKey: string): Promise<boolean> {
    try {
      const modelPath = `${this.downloadPath}${modelKey}/model.onnx`;
      const fileInfo = await FileSystem.getInfoAsync(modelPath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking model download status:', error);
      return false;
    }
  }

  private async downloadModel(modelKey: string): Promise<boolean> {
    const model = this.models.get(modelKey);
    if (!model) return false;

    try {
      // Create directory if it doesn't exist
      await FileSystem.makeDirectoryAsync(`${this.downloadPath}${modelKey}`, {
        intermediates: true
      });

      const modelPath = `${this.downloadPath}${modelKey}/model.onnx`;
      
      console.log(`Downloading ${model.name}...`);
      
      const downloadResumable = FileSystem.createDownloadResumable(
        model.downloadUrl,
        modelPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          console.log(`Download progress: ${(progress * 100).toFixed(1)}%`);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result) {
        model.isDownloaded = true;
        await this.saveModelStatus(modelKey, true);
        console.log(`✅ ${model.name} downloaded successfully`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error downloading model ${modelKey}:`, error);
      return false;
    }
  }

  private async getAvailableStorage(): Promise<number> {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) {
        console.warn('Document directory not available');
        return 1000; // Assume 1GB available for now
      }
      
      const info = await FileSystem.getInfoAsync(documentDir);
      // Estimate available space (this is approximate)
      return 1000; // Assume 1GB available for now
    } catch (error) {
      console.error('Error checking storage:', error);
      return 0;
    }
  }

  private async saveModelStatus(modelKey: string, isDownloaded: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`model_${modelKey}_downloaded`, JSON.stringify({
        isDownloaded,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving model status:', error);
    }
  }

  async getModelPath(modelKey: string): Promise<string> {
    const model = this.models.get(modelKey);
    if (!model) {
      throw new Error(`Model ${modelKey} not found`);
    }

    if (!model.isDownloaded) {
      throw new Error(`Model ${modelKey} not downloaded`);
    }

    return `${this.downloadPath}${modelKey}/model.onnx`;
  }

  getAvailableModels(): ModelInfo[] {
    return Array.from(this.models.values());
  }

  getRecommendedModel(): string {
    // Return Phi-3 Mini as our primary model
    return 'phi-3-mini';
  }

  async updateModelPerformance(modelKey: string, generationTime: number, success: boolean): Promise<void> {
    const model = this.models.get(modelKey);
    if (!model) return;

    // Update performance metrics
    const currentAvg = model.performance.avgGenerationTime;
    const currentSuccessRate = model.performance.successRate;
    
    model.performance.avgGenerationTime = (currentAvg + generationTime) / 2;
    model.performance.successRate = success ? 
      Math.min(currentSuccessRate + 0.01, 1.0) : 
      Math.max(currentSuccessRate - 0.02, 0.0);

    model.lastUsed = new Date();
  }
} 