import Tts from 'react-native-tts';

export const initializeTTS = async () => {
  try {
    await Tts.getInitStatus();
    console.log('TTS 初始化成功');
    Tts.setDefaultLanguage('zh-CN');
    Tts.setDefaultRate(0.35);
    Tts.setDefaultPitch(1.8);
    
    const voices = await Tts.voices();
    const chineseVoice = voices.find(v => 
      v.language === 'zh-CN' || v.language === 'cmn-CN'
    );
    if (chineseVoice) {
      Tts.setDefaultVoice(chineseVoice.id);
      console.log('已选择中文语音:', chineseVoice.name);
    }
  } catch (err) {
    console.log('TTS初始化异常:', err);
  }
};

export const getVoiceConfig = (action, stage) => {
  const stageConfig = {
    baby: { baseRate: 0.45, basePitch: 1.8 },
    child: { baseRate: 0.4, basePitch: 1.6 },
    teen: { baseRate: 0.35, basePitch: 1.4 },
    adult: { baseRate: 0.3, basePitch: 1.2 },
  };

  const base = stageConfig[stage] || stageConfig.child;
  
  const actionAdjust = {
    feed: { rate: 1.1, pitch: 1.0 },
    play: { rate: 1.2, pitch: 1.1 },
    clean: { rate: 0.9, pitch: 1.0 },
    sleep: { rate: 0.6, pitch: 0.8 },
    wake: { rate: 1.1, pitch: 1.2 },
    sad: { rate: 0.8, pitch: 0.9 },
    default: { rate: 1.0, pitch: 1.0 },
  };

  const adjust = actionAdjust[action] || actionAdjust.default;
  
  return {
    rate: base.baseRate * adjust.rate,
    pitch: base.basePitch * adjust.pitch,
  };
};