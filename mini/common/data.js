const INITIAL_DATA = [
  { id: 101, name: '图像识别', description: 'AI自动生成精美图像', category: 'special', icon: '/static/picture.png' },
  { id: 102, name: '思维导图', description: '智能生成各类导图', category: 'special', icon: '/static/txt.png' },
  { id: 103, name: '语音合成', description: 'AI创作动听声音', category: 'special', icon: '/static/7.png' },
  { id: 104, name: 'PPT生成', description: '一键生成精美PPT', category: 'special', icon: '/static/list/12.png' },
  { id: 105, name: '视频生成', description: '生成炫酷视频', category: 'special', icon: '/static/list/3.png' },
  { id: 106, name: '音乐生成', description: '生成炫酷音乐', category: 'special', icon: '/static/list/5.png' },
  { id: 1, name: '豆包', description: '字节跳动出品，智能对话与创作。', category: 'dialogue', icon: '/static/list/1.png', url: 'https://www.doubao.com/' },
  { id: 2, name: '文心一言', description: '百度出品，知识增强大语言模型。', category: 'dialogue', icon: '/static/list/2.png', url: 'https://yiyan.baidu.com/' },
  { id: 3, name: 'Midjourney', description: '领先的AI绘画和图像生成工具。', category: 'image', icon: '/static/list/3.png', url: 'https://www.midjourney.com/' },
  { id: 4, name: 'Stable Diffusion', description: '开源的文生图模型，社区生态丰富。', category: 'image', icon: '/static/list/4.png', url: 'https://dreamstudio.ai/' },
  { id: 5, name: 'GitHub Copilot', description: '微软与OpenAI合作，AI代码助手。', category: 'code', icon: '/static/list/5.png', url: 'https://copilot.github.com/' },
  { id: 6, name: '通义灵码', description: '阿里出品，智能编码助手。', category: 'code', icon: '/static/list/6.png', url: 'https://lingma.aliyun.com/lingma' },
  { id: 7, name: 'Kimi', description: '月之暗面出品，超长文本处理。', category: 'dialogue', icon: '/static/list/7.png', url: 'https://kimi.moonshot.cn/' },
  { id: 8, name: 'Sora', description: 'OpenAI出品，颠覆性的文生视频模型。', category: 'video', icon: '/static/list/8.png', url: 'https://openai.com/sora/' },
  { id: 9, name: '通义千问', description: '阿里大模型，一个更懂你的AI助手。', category: 'dialogue', icon: '/static/list/9.png', url: 'https://tongyi.aliyun.com/qianwen/' },
  { id: 10, name: '文心一格', description: '百度出品的AI艺术和创意辅助平台。', category: 'image', icon: '/static/list/10.png', url: 'https://yige.baidu.com/' },
  { id: 11, name: '剪映AI', description: '字节出品，强大的AI视频创作工具。', category: 'video', icon: '/static/list/11.png', url: 'https://www.capcut.cn/' },
  { id: 12, name: 'WPS AI', description: '金山办公出品，赋能Office全家桶。', category: 'office', icon: '/static/list/12.png', url: 'https://ai.wps.cn/' },
  { id: 13, name: '通义听悟', description: '阿里出品，专注于会议纪要与语音转写。', category: 'office', icon: '/static/list/13.png', url: 'https://tingwu.aliyun.com/' },
  { id: 14, name: '讯飞听见', description: '科大讯飞出品，专业语音转写与翻译服务。', category: 'audio', icon: '/static/list/14.png', url: 'https://www.iflyrec.com/' },
  { id: 15, name: '魔音工坊', description: 'AI配音与音频处理工具，声音逼真。', category: 'audio', icon: '/static/list/15.png', url: 'https://www.moyin.com/' },
  { id: 16, name: '百度GBI', description: '百度商业智能，提供数据洞察解决方案。', category: 'scheme', icon: '/static/list/16.png', url: 'https://gbi.cloud.baidu.com/' },
  { id: 17, name: '华为云AI', description: '华为提供的一系列企业级AI服务与解决方案。', category: 'scheme', icon: '/static/list/17.png', url: 'https://www.huaweicloud.com/' },
  { id: 18, name: 'chatPPT', description: '会说话就会写PPT,免费生成演示文稿。', category: 'office', icon: '/static/list/6.png', url: 'https://chat-ppt.com/' }
];

const STORAGE_KEY = 'ai_models_data';

export const getAIModels = () => {
  let data = uni.getStorageSync(STORAGE_KEY);
  if (!data || data.length === 0) {
    data = INITIAL_DATA;
    uni.setStorageSync(STORAGE_KEY, data);
  }
  return data;
};

export const addAIModel = (model) => {
  const data = getAIModels();
  // Generate a new ID
  const maxId = data.reduce((max, item) => Math.max(max, item.id), 0);
  model.id = maxId + 1;
  data.push(model);
  uni.setStorageSync(STORAGE_KEY, data);
  return data;
};

export const getAIModelById = (id) => {
    const data = getAIModels();
    return data.find(item => item.id == id);
}

export const isSystemItem = (id) => {
    return INITIAL_DATA.some(item => item.id === id);
}

export const deleteAIModel = (id) => {
  let data = getAIModels();
  data = data.filter(item => item.id !== id);
  uni.setStorageSync(STORAGE_KEY, data);
  return data;
};
