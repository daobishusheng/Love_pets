import Tts from 'react-native-tts';
import { Platform } from 'react-native';

// 初始化 TTS
export const initializeTTS = async () => {
  try {
    await Tts.getInitStatus();
    console.log('TTS 初始化成功');
    
    // 设置中文（如果模拟器支持）
    Tts.setDefaultLanguage('zh-CN');
    
    // 设置语速（0.01最慢，0.99最快）
    Tts.setDefaultRate(0.3);
    
    // 设置音调（1.0正常）
    Tts.setDefaultPitch(1.0);
    
    // 可选：列出可用的语音
    const voices = await Tts.voices();
    console.log('可用语音:', voices);
    
    // 自动选择一个中文语音（如果有）
    const chineseVoice = voices.find(v => 
      v.language === 'zh-CN' || v.language === 'cmn-CN'
    );
    if (chineseVoice) {
      Tts.setDefaultVoice(chineseVoice.id);
      console.log('已选择中文语音:', chineseVoice.name);
    }
  } catch (err) {
    if (err.code === 'no_engine') {
      console.log('没有TTS引擎，但我们已经安装了SherpaTTS');
      // 可以提示用户检查设置
    } else {
      console.error('TTS初始化异常:', err);
    }
  }
};

// 说话函数
export const speak = async (text, options = {}) => {
  try {
    await Tts.getInitStatus();
    Tts.speak(text, options);
  } catch (err) {
    console.log('TTS暂时不可用:', err);
    // 可选：弹个提示，但不影响主要功能
  }
};

// 停止说话
export const stopSpeaking = () => {
  Tts.stop();
};