<template>
  <view class="detail-container" :class="{ 'dark-mode': currentTheme === 'dark' }" v-if="item">
    
    <!-- 通用头部信息 -->
    <view class="header-section">
      <image :src="item.icon" class="detail-icon" mode="aspectFit"></image>
      <view class="header-info">
        <text class="detail-title">{{ item.name }}</text>
        <text class="detail-desc">{{ item.description }}</text>
        <text class="detail-category">分类：{{ item.category }}</text>
      </view>
    </view>

    <!-- 特殊功能区域：图像识别 (ID 101) -->
    <view v-if="item.id === 101" class="workflow-section">
      <view class="input-group">
        <text class="label">图片链接</text>
        <input class="input" v-model="inputUrl" placeholder="请输入图片URL地址" />
      </view>
      <button class="btn primary" @tap="runWorkflow" :loading="loading">开始识别</button>
      
      <view v-if="result" class="result-box">
        <view style="display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 20rpx;">
            <view style="width: 35rpx; opacity: 0;"></view>
            <text class="result-title" style="margin-bottom: 0;">识别结果</text>
            <view @tap="copyText(result)" class="copy-btn-circle">
                <view class="copy-icon"></view>
            </view>
        </view>
        <scroll-view scroll-y class="result-content-scroll">
          <text class="result-content">{{ result }}</text>
        </scroll-view>
      </view>
    </view>

    <!-- 特殊功能区域：思维导图 (ID 102) -->
    <view v-if="item.id === 102" class="workflow-section">
      <view class="input-group">
        <text class="label">导图主题</text>
        <textarea class="textarea" v-model="mindMapInput" placeholder="请输入思维导图的主题" />
      </view>
      <button class="btn primary" @tap="runMindMapWorkflow" :loading="mindMapLoading">生成导图</button>
      
      <view v-if="mindMapResult.url" class="result-box">
        <text class="result-title">生成结果</text>
        
        <view class="link-box">
          <text class="link-text">导图已生成</text>
          <view class="btn-row" style="display: flex; justify-content: center; gap: 20rpx; margin-top: 20rpx;">
             <button class="btn small" @tap="openLink(mindMapResult.url)">打开</button>
             <!-- 使用 picture 字段进行下载，如果不存在则降级使用 url -->
             <button class="btn small" @tap="openLink(mindMapResult.picture || mindMapResult.url)">下载并保存</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 特殊功能区域：PPT生成 (ID 104) -->
    <view v-if="item.id === 104" class="workflow-section">
      <view class="input-group">
        <text class="label">PPT主题</text>
        <textarea class="textarea" v-model="pptInput" placeholder="请输入PPT主题，例如：太空探索" />
      </view>
      <view class="input-group">
        <text class="label">主题颜色</text>
        <picker @change="(e) => pptColor = pptColors[e.detail.value]" :value="pptColors.indexOf(pptColor)" :range="pptColors">
          <view class="picker-view">
            {{ pptColor }}
          </view>
        </picker>
      </view>
      <button class="btn primary" @tap="runPPTWorkflow" :loading="pptLoading">生成PPT</button>
      
      <view v-if="pptResult" class="result-box">
        <text class="result-title">生成结果</text>
        <view class="link-box">
          <text class="link-text">PPT已生成</text>
          <view class="btn-row" style="display: flex; justify-content: center; gap: 20rpx; margin-top: 20rpx;">
             <button class="btn small" @tap="openLink(pptResult)">打开链接</button>
             <button class="btn small" @tap="copyLink(pptResult)">复制链接</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 特殊功能区域：语音合成 (ID 103) -->
    <view v-if="item.id === 103" class="workflow-section">
      <view class="input-group">
        <text class="label">合成文本</text>
        <textarea class="textarea" v-model="voiceInput.text" placeholder="请输入要合成的文本" />
      </view>
      <view class="input-group">
        <text class="label">语言</text>
        <input class="input" v-model="voiceInput.language" placeholder="例如：英语" />
      </view>
      <view class="input-group">
        <text class="label">音色选择</text>
        <picker @change="onVoiceChange" :value="voiceInput.voiceIndex" :range="voiceOptions" range-key="name">
          <view class="picker-view">
            {{ voiceOptions[voiceInput.voiceIndex].name }}
          </view>
        </picker>
      </view>
      <button class="btn primary" @tap="runVoiceWorkflow" :loading="voiceLoading">开始合成</button>
      
      <view v-if="voiceResult" class="result-box">
        <view style="display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 20rpx;">
            <view style="width: 35rpx; opacity: 0;"></view>
            <text class="result-title" style="margin-bottom: 0;">合成结果</text>
            <view @tap="playVoice(voiceResult)" class="play-btn-circle">
                <view class="play-icon-triangle"></view>
            </view>
        </view>
        <view style="padding: 20rpx; margin-bottom: 20rpx; text-align: center;">
            <text style="font-size: 28rpx; color: #666;">{{ voiceInput.text }}</text>
        </view>
        <view class="btn-row" style="display: flex; justify-content: center; gap: 20rpx; margin-top: 20rpx;">
             <button class="btn small" @tap="openLink(voiceResult)">打开</button>
             <button class="btn small" @tap="downloadAndSave(voiceResult, 'audio', voiceInput.text.substring(0, 10) + '.mp3')">下载并保存</button>
        </view>
      </view>
    </view>

    <!-- 特殊功能区域：视频生成 (ID 105) -->
    <view v-if="item.id === 105" class="workflow-section">
      <view class="input-group">
        <text class="label">视频描述</text>
        <textarea class="textarea" v-model="videoInput" placeholder="请输入视频描述，例如：生成3秒的星空流动视频" />
      </view>
      <button class="btn primary" @tap="runVideoWorkflow" :loading="videoLoading">生成视频</button>
      
      <view v-if="videoResult" class="result-box">
        <text class="result-title">生成结果</text>
        <video :src="videoResult" controls class="result-video" style="width: 100%; border-radius: 20rpx; margin-bottom: 20rpx;"></video>
        <view class="btn-row" style="display: flex; justify-content: center; gap: 20rpx; margin-top: 20rpx;">
             <button class="btn small" @tap="openLink(videoResult)">打开</button>
             <button class="btn small" @tap="downloadAndSave(videoResult, 'video', videoInput.substring(0, 10) + '.mp4')">下载并保存</button>
        </view>
      </view>
    </view>

    <!-- 特殊功能区域：音乐生成 (ID 106) -->
    <view v-if="item.id === 106" class="workflow-section">
      <view class="input-group">
        <text class="label">音乐主题</text>
        <textarea class="textarea" v-model="musicInput" placeholder="请输入音乐主题，例如：主题《江湖再见》" />
      </view>
      
      <view class="input-group">
        <text class="label">性别 (Gender)</text>
        <picker @change="(e) => musicGender = musicGenders[e.detail.value]" :value="musicGenders.indexOf(musicGender)" :range="musicGenders">
          <view class="picker-view">{{ musicGender }}</view>
        </picker>
      </view>
      
      <view class="input-group">
        <text class="label">情绪 (Mood)</text>
        <picker @change="(e) => musicMood = musicMoods[e.detail.value]" :value="musicMoods.indexOf(musicMood)" :range="musicMoods">
          <view class="picker-view">{{ musicMood }}</view>
        </picker>
      </view>
      
      <view class="input-group">
        <text class="label">音色 (Timbre)</text>
        <picker @change="(e) => musicTimbre = musicTimbres[e.detail.value]" :value="musicTimbres.indexOf(musicTimbre)" :range="musicTimbres">
          <view class="picker-view">{{ musicTimbre }}</view>
        </picker>
      </view>
      
      <view class="input-group">
        <text class="label">风格 (Genre)</text>
        <picker @change="(e) => musicGenre = musicGenres[e.detail.value]" :value="musicGenres.indexOf(musicGenre)" :range="musicGenres">
          <view class="picker-view">{{ musicGenre }}</view>
        </picker>
      </view>

      <button class="btn primary" @tap="runMusicWorkflow" :loading="musicLoading">生成音乐</button>
      
      <view v-if="musicResult" class="result-box">
        <view style="display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 20rpx;">
            <!-- 复制按钮 (左侧) -->
            <view @tap="copyText(musicResult.words)" class="copy-btn-circle">
                <view class="copy-icon"></view>
            </view>
            
            <text class="result-title" style="margin-bottom: 0;">生成结果</text>
            
            <!-- 播放按钮 (右侧) -->
            <view @tap="playVoice(musicResult.output)" class="play-btn-circle">
                <view class="play-icon-triangle"></view>
            </view>
        </view>
        
        <view style="padding: 20rpx; margin-bottom: 20rpx; text-align: center;">
            <text selectable user-select style="font-size: 28rpx; color: #666; white-space: pre-wrap;">{{ musicResult.words }}</text>
        </view>

        <view class="btn-row" style="display: flex; justify-content: center; gap: 20rpx; margin-top: 20rpx; flex-wrap: wrap;">
             <button class="btn small" @tap="openLink(musicResult.output)">打开</button>
             <button class="btn small" @tap="downloadAndSave(musicResult.output, 'audio', musicInput.substring(0, 10) + '.mp3')">下载</button>
        </view>
      </view>
    </view>

    <view class="button-group">
      <button class="btn warm" @tap="goBack">返回列表</button>
      <button class="btn primary" v-if="item.url" @tap="openLink(item.url)">进入官网</button>
      <!-- <button class="btn danger" @tap="handleDelete">删除收藏</button> -->
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { currentTheme } from '@/common/theme.js';
import { getAIModelById } from '@/common/data.js';



const item = ref(null);
const inputUrl = ref('https://pixnio.com/zh/media/zh-3406453');
const loading = ref(false);
const result = ref('');

// 语音合成相关状态
const voiceOptions = [
  { id: '7426725529589678107', name: '邻家男孩' },
  { id: '7568423452617556022', name: '魅力女友' },
  { id: '7568423452617588790', name: '儒雅逸辰' },
  { id: '7426720361733144585', name: '邻家女孩' },
  { id: '7426725529589596187', name: '甜美小源' },
  { id: '7468512265134964787', name: '武则天' }
];

const voiceInput = ref({
  text: 'hello',
  language: '英语',
  voiceId: voiceOptions[3].id, // 默认邻家女孩
  voiceIndex: 3 // 默认选中索引
});
const voiceLoading = ref(false);
const voiceResult = ref('');

// 思维导图相关状态
const mindMapInput = ref('输出一个国内外大模型名称的导图');
const mindMapLoading = ref(false);
const mindMapResult = ref({
  url: '',
  image: ''
});

// PPT生成相关状态
const pptInput = ref('生成太空探索游戏的太空主题ppt');
const pptColor = ref('黑色');
const pptLoading = ref(false);
const pptResult = ref('');
const pptColors = ['黑色', '白色', '蓝色', '红色', '绿色', '紫色', '橙色'];

// 视频生成相关状态
const videoInput = ref('生成3秒的星空流动视频');
const videoLoading = ref(false);
const videoResult = ref('');

// 音乐生成相关状态
const musicInput = ref('主题《江湖再见》');
const musicGender = ref('Female');
const musicMood = ref('Happy');
const musicTimbre = ref('Bright');
const musicGenre = ref('Chinese Style');
const musicLoading = ref(false);
const musicResult = ref('');

const musicGenders = ['Female', 'Male'];
const musicMoods = ['Happy', 'Sad', 'Excited', 'Relaxed'];
const musicTimbres = ['Bright', 'Deep', 'Soft', 'Husky'];
const musicGenres = ['Chinese Style', 'Pop', 'Rock', 'Jazz', 'Electronic'];

// 音色选择改变
const onVoiceChange = (e) => {
  const index = e.detail.value;
  voiceInput.value.voiceIndex = index;
  voiceInput.value.voiceId = voiceOptions[index].id;
};

// 音频播放上下文
const innerAudioContext = uni.createInnerAudioContext();
innerAudioContext.autoplay = true;

const playVoice = (url) => {
  if (!url) return;
  innerAudioContext.src = url;
  innerAudioContext.play();
};

onUnload(() => {
  if (innerAudioContext) {
    innerAudioContext.destroy();
  }
});

onLoad((options) => {
  if (options.id) {
    // uni-app 路由传参都是字符串，需要转换
    const foundItem = getAIModelById(parseInt(options.id));
    if (foundItem) {
      item.value = foundItem;
      uni.setNavigationBarTitle({ title: foundItem.name });
    }
  }
});

// 保存文件到 production 目录
const saveToProduction = (tempFilePath, fileName) => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL('_doc/', (root) => {
      root.getDirectory('production', { create: true }, (dirEntry) => {
        plus.io.resolveLocalFileSystemURL(tempFilePath, (tempEntry) => {
          
          // 原始文件名
          const originalName = fileName || tempEntry.name;
          
          // 递归查找可用文件名
          const checkAndMove = (nameToCheck, counter) => {
              dirEntry.getFile(nameToCheck, { create: false }, 
                  () => {
                      // 文件存在，构造新名字重试: name(1).ext
                      let newName = '';
                      const lastDotIndex = originalName.lastIndexOf('.');
                      if (lastDotIndex !== -1) {
                          const namePart = originalName.substring(0, lastDotIndex);
                          const extPart = originalName.substring(lastDotIndex);
                          newName = `${namePart}(${counter})${extPart}`;
                      } else {
                          newName = `${originalName}(${counter})`;
                      }
                      checkAndMove(newName, counter + 1);
                  }, 
                  () => {
                      // 文件不存在，可以使用
                      tempEntry.moveTo(dirEntry, nameToCheck, (finalEntry) => {
                          resolve(finalEntry.fullPath);
                      }, reject);
                  }
              );
          };
          
          checkAndMove(originalName, 1);

        }, reject);
      }, reject);
    }, reject);
    // #endif

    // #ifdef H5
    // H5 不支持 saveFile，直接返回临时路径
    resolve(tempFilePath);
    // #endif

    // #ifdef MP
    uni.saveFile({
      tempFilePath: tempFilePath,
      success: (res) => resolve(res.savedFilePath),
      fail: reject
    });
    // #endif
  });
};

// 下载并保存到作品集
const downloadAndSave = (url, type, name) => {
    if (!url) return;
    uni.showLoading({ title: '下载中...' });
    
    uni.downloadFile({
        url: url,
        success: (res) => {
            if (res.statusCode === 200) {
                const tempFilePath = res.tempFilePath;
                // Generate a filename if not provided
                let fileName = name;
                if (!fileName) {
                    const ext = url.split('.').pop().split('?')[0] || 'file';
                    fileName = `${Date.now()}.${ext}`;
                }
                
                saveToProduction(tempFilePath, fileName).then((savedPath) => {
                    // #ifdef H5
                    // H5 触发浏览器下载
                    const a = document.createElement('a');
                    a.href = tempFilePath;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    // #endif

                    // 如果是图片，尝试保存到系统相册
                    if (type === 'image') {
                        uni.saveImageToPhotosAlbum({
                            filePath: tempFilePath,
                            success: () => {
                                uni.showToast({ title: '已保存到相册', icon: 'success' });
                            },
                            fail: (err) => {
                                console.log('保存相册失败', err);
                                // 不阻断流程，继续保存到作品集
                            }
                        });
                    }

                    // Update user_works storage
                    const storedWorks = uni.getStorageSync('user_works') || [];
                    
                    // Determine type for works list
                    let workType = 'file';
                    if (type === 'video') workType = 'video';
                    if (type === 'audio' || type === 'music') workType = 'audio';
                    if (type === 'image') workType = 'image';
                    
                    const newWork = {
                        type: workType,
                        url: savedPath,
                        name: name || '下载的文件',
                        poster: type === 'video' ? '/static/video_cover_default.jpg' : '' 
                    };
                    
                    storedWorks.unshift(newWork);
                    uni.setStorageSync('user_works', storedWorks);
                    
                    uni.hideLoading();
                    uni.showToast({ title: '已保存到作品集', icon: 'success' });
                }).catch((err) => {
                    console.error('Save failed', err);
                    uni.hideLoading();
                    uni.showToast({ title: '保存失败', icon: 'none' });
                });
            } else {
                uni.hideLoading();
                uni.showToast({ title: '下载失败', icon: 'none' });
            }
        },
        fail: (err) => {
            console.error('Download failed', err);
            uni.hideLoading();
            uni.showToast({ title: '下载请求失败', icon: 'none' });
        }
    });
};

// 运行语音合成工作流
const runVoiceWorkflow = () => {
  if (!voiceInput.value.text) {
    return uni.showToast({ title: '请输入文本', icon: 'none' });
  }
  
  voiceLoading.value = true;
  voiceResult.value = '';
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588454713415483419',
      parameters: {
        input: voiceInput.value.text,
        language: voiceInput.value.language,
        voice_id: voiceInput.value.voiceId
      }
    },
    success: (res) => {
      console.log('Voice API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          // 解析返回的数据，假设返回的是包含音频链接的 JSON 字符串
          // 根据 Coze 工作流的常见返回，可能是直接的 URL 或者 JSON 对象
          // 这里假设返回的是 JSON 字符串，里面有个 output 字段是 URL
          // 或者直接是 URL 字符串
          let outputUrl = '';
          try {
             const data = JSON.parse(res.data.data);
             outputUrl = data.output || data.url || res.data.data;
          } catch(e) {
             outputUrl = res.data.data;
          }
          
          // 清理一下可能包含的引号
          if (outputUrl && typeof outputUrl === 'string') {
             outputUrl = outputUrl.replace(/^"|"$/g, '');
          }
          
          voiceResult.value = outputUrl;
        } catch (e) {
          uni.showToast({ title: '解析结果失败', icon: 'none' });
        }
      } else {
        uni.showToast({ title: '调用失败: ' + (res.data.msg || '未知错误'), icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '请求失败', icon: 'none' });
    },
    complete: () => {
      voiceLoading.value = false;
    }
  });
};

// 运行思维导图工作流
const runMindMapWorkflow = () => {
  if (!mindMapInput.value) {
    return uni.showToast({ title: '请输入主题', icon: 'none' });
  }
  
  mindMapLoading.value = true;
  mindMapResult.value = { url: '', image: '' };
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588486327668686888',
      parameters: {
        input: mindMapInput.value
      }
    },
    success: (res) => {
      console.log('MindMap API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          let data = res.data.data;
          // 如果是字符串，尝试解析
          if (typeof data === 'string') {
             try {
                data = JSON.parse(data);
             } catch(e) {
                console.log('Data is not JSON string, using raw string');
             }
          }
          
          console.log('Parsed Data:', data);
          
          // 如果解析后是对象
          if (typeof data === 'object' && data !== null) {
              // 获取 output (跳转链接) 和 picture (图片链接)
              const output = data.output || data.url || data.link;
              const picture = data.picture || data.image || data.img;

              if (output && typeof output === 'string' && output.startsWith('http')) {
                  mindMapResult.value.url = output;
              }
              
              if (picture && typeof picture === 'string' && picture.startsWith('http')) {
                  mindMapResult.value.picture = picture;
              }
              
              // 如果没有找到明确的字段，尝试遍历
              if (!mindMapResult.value.url) {
                  const values = Object.values(data);
                  for (const val of values) {
                      if (typeof val === 'string' && val.startsWith('http')) {
                          mindMapResult.value.url = val;
                          break;
                      }
                  }
              }
          } else if (typeof data === 'string' && data.startsWith('http')) {
              // 如果直接返回的是一个链接
              mindMapResult.value.url = data;
          }
          
        } catch (e) {
          console.error('Parse Error:', e);
          uni.showToast({ title: '解析结果失败', icon: 'none' });
        }
      } else {
        uni.showToast({ title: '调用失败: ' + (res.data.msg || '未知错误'), icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '请求失败', icon: 'none' });
    },
    complete: () => {
      mindMapLoading.value = false;
    }
  });
};

// 运行PPT生成工作流
const runPPTWorkflow = () => {
  if (!pptInput.value) {
    return uni.showToast({ title: '请输入PPT主题', icon: 'none' });
  }
  
  pptLoading.value = true;
  pptResult.value = '';
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588496913353670697',
      parameters: {
        input: pptInput.value,
        color: pptColor.value
      }
    },
    success: (res) => {
      console.log('PPT API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          let data = res.data.data;
          if (typeof data === 'string') {
             try { data = JSON.parse(data); } catch(e) {}
          }
          
          // 尝试获取输出链接
          let outputUrl = '';
          if (typeof data === 'object') {
              outputUrl = data.output || data.url || data.link || '';
              if (!outputUrl) {
                  // 遍历查找 http 链接
                  const values = Object.values(data);
                  for (const val of values) {
                      if (typeof val === 'string' && val.startsWith('http')) {
                          outputUrl = val;
                          break;
                      }
                  }
              }
          } else if (typeof data === 'string' && data.startsWith('http')) {
              outputUrl = data;
          }
          
          pptResult.value = outputUrl;
          
        } catch (e) {
          uni.showToast({ title: '解析结果失败', icon: 'none' });
        }
      } else {
        uni.showToast({ title: '调用失败: ' + (res.data.msg || '未知错误'), icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '请求失败', icon: 'none' });
    },
    complete: () => {
      pptLoading.value = false;
    }
  });
};

// 运行视频生成工作流
const runVideoWorkflow = () => {
  if (!videoInput.value) {
    return uni.showToast({ title: '请输入视频描述', icon: 'none' });
  }
  
  videoLoading.value = true;
  videoResult.value = '';
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588494196790919177',
      parameters: {
        input: videoInput.value
      }
    },
    success: (res) => {
      console.log('Video API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          let data = res.data.data;
          if (typeof data === 'string') {
             try { data = JSON.parse(data); } catch(e) {}
          }
          
          let outputUrl = '';
          if (typeof data === 'object') {
              outputUrl = data.output || data.url || data.link || data.video_url || '';
              if (!outputUrl) {
                  const values = Object.values(data);
                  for (const val of values) {
                      if (typeof val === 'string' && val.startsWith('http')) {
                          outputUrl = val;
                          break;
                      }
                  }
              }
          } else if (typeof data === 'string' && data.startsWith('http')) {
              outputUrl = data;
          }
          
          if (outputUrl) {
            videoResult.value = outputUrl;
          } else {
            uni.showToast({ title: '未找到视频链接', icon: 'none' });
          }
          
        } catch (e) {
          uni.showToast({ title: '解析结果失败', icon: 'none' });
        }
      } else {
        uni.showToast({ title: '调用失败: ' + (res.data.msg || '未知错误'), icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '请求失败', icon: 'none' });
    },
    complete: () => {
      videoLoading.value = false;
    }
  });
};

// 运行音乐生成工作流
const runMusicWorkflow = () => {
  if (!musicInput.value) {
    return uni.showToast({ title: '请输入音乐主题', icon: 'none' });
  }
  
  musicLoading.value = true;
  musicResult.value = null;
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588416823566696500',
      parameters: {
        input: musicInput.value,
        Gender: musicGender.value,
        Mood: musicMood.value,
        Timbre: musicTimbre.value,
        gener: musicGenre.value
      }
    },
    success: (res) => {
      console.log('Music API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          let data = res.data.data;
          if (typeof data === 'string') {
             try { data = JSON.parse(data); } catch(e) {}
          }
          
          // 新版工作流返回 { output: "url", words: "lyrics" }
          if (data && data.output) {
              musicResult.value = {
                  output: data.output,
                  words: data.words || '暂无歌词'
              };
          } else {
              // 兼容旧版或错误处理
              let outputUrl = '';
              if (typeof data === 'object') {
                  outputUrl = data.output || data.url || data.link || data.audio_url || '';
              } else if (typeof data === 'string' && data.startsWith('http')) {
                  outputUrl = data;
              }
              
              if (outputUrl) {
                  musicResult.value = { output: outputUrl, words: '暂无歌词' };
              } else {
                  uni.showToast({ title: '未找到音乐链接', icon: 'none' });
              }
          }
          
        } catch (e) {
          console.error(e);
          uni.showToast({ title: '解析结果失败', icon: 'none' });
        }
      } else {
        uni.showToast({ title: '调用失败: ' + (res.data.msg || '未知错误'), icon: 'none' });
      }
    },
    fail: (err) => {
      uni.showToast({ title: '请求失败', icon: 'none' });
    },
    complete: () => {
      musicLoading.value = false;
    }
  });
};

// 打开外部链接
const openLink = (url) => {
  // #ifdef H5
  window.open(url, '_blank');
  // #endif
  
  // #ifdef APP-PLUS
  // 使用内部 WebView 打开
  uni.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent(url)
  });
  // #endif
  
  // #ifdef MP
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' });
    }
  });
  // #endif
};

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url]
  });
};

// 复制链接
const copyLink = (url) => {
  uni.setClipboardData({
    data: url,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'none' });
    }
  });
};

// 复制文本
const copyText = (text) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: '内容已复制', icon: 'none' });
    }
  });
};

// 运行工作流 (Coze API)
const runWorkflow = () => {
  if (!inputUrl.value) {
    return uni.showToast({ title: '请输入图片URL', icon: 'none' });
  }
  
  loading.value = true;
  result.value = '';
  
  uni.request({
    url: 'https://api.coze.cn/v1/workflow/run',
    method: 'POST',
    header: {
      'Authorization': 'Bearer pat_zXdCFLGqQmEw4bZjUdeBKvF3FtZz2GW23gX3wwhphdkdryegteN57dKQdaN4SJnH',
      'Content-Type': 'application/json'
    },
    data: {
      workflow_id: '7588438623742967808',
      parameters: {
        input: inputUrl.value
      }
    },
    success: (res) => {
      console.log('API Response:', res.data);
      if (res.data && res.data.code === 0) {
        try {
          // 尝试解析返回的 JSON 字符串数据
          const data = JSON.parse(res.data.data);
          result.value = data.output || res.data.data;
        } catch (e) {
          // 如果不是 JSON 字符串，直接显示
          result.value = res.data.data;
        }
      } else {
        result.value = '调用失败: ' + (res.data.msg || '未知错误');
      }
    },
    fail: (err) => {
      result.value = '请求失败: ' + err.errMsg;
    },
    complete: () => {
      loading.value = false;
    }
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 删除/收藏操作
const handleDelete = () => {
  uni.showModal({
    title: '确认操作',
    content: '您确定要删除这个收藏吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({ title: '删除成功', icon: 'success' });
        // 实际开发中，这里会执行删除逻辑，然后返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      } else if (res.cancel) {
        console.log('用户点击取消');
      }
    }
  });
};
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  min-height: 100vh;
  background-color: #f9f9f9; /* Light background */
}

.header-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-bottom: 30rpx;
  padding: 0 10rpx;
  box-sizing: border-box;
}

.detail-icon {
  width: 180rpx;
  height: 180rpx;
  border-radius: 30rpx;
  margin-right: 30rpx;
  margin-bottom: 0;
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.header-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  overflow: hidden;
}

.detail-title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  color: #333;
  text-align: left;
}

.detail-desc {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  text-align: left;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-category {
  font-size: 24rpx;
  color: #5d4037; /* Darker brown for contrast */
  background-color: #ffe0b2; /* Light Orange/Yellow */
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  align-self: flex-start;
  margin-bottom: 0;
}

.button-group {
  display: flex;
  margin-top: 60rpx;
  width: 100%;
  gap: 20rpx;
}

.btn {
  flex: 1;
  margin: 0;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: 600;
  height: 88rpx;
  line-height: 88rpx;
  border: none;
}
.btn::after { border: none; }

.btn.primary {
  background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%); /* Light Green/Yellow Gradient */
  color: #3e5d48;
  box-shadow: 0 8rpx 20rpx rgba(168, 230, 207, 0.4);
}

.btn.warm {
  background: linear-gradient(135deg, #f2b9a6ff 10%, #faa082ff 100%); /* Warm Pink Gradient */
  color: #5d4037;
  box-shadow: 0 8rpx 20rpx rgba(252, 182, 159, 0.4);
}

.btn.danger {
  background-color: #ffcdd2; /* Light Red */
  color: #c62828;
}

/* Workflow Styles */
.workflow-section {
  width: 100%;
  margin-top: 20rpx;
  padding: 40rpx;
  background-color: #ffffff;
  border-radius: 30rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.05);
}

.dark-mode .workflow-section {
  background-color: #2c2c2c;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}

.label {
  font-size: 28rpx;
  margin-bottom: 16rpx;
  font-weight: 600;
  color: #555;
  padding-left: 10rpx;
}

.input, .picker-view, .textarea {
  background-color: #f5f7fa; /* Very light gray/blue */
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  padding: 24rpx;
  font-size: 28rpx;
  transition: all 0.3s;
}

.input:focus, .textarea:focus {
  background-color: #fff;
  border-color: #a8e6cf; /* Focus color */
}

.input { height: 70rpx; }
.textarea { height: 100rpx; width: 200%; box-sizing: border-box; }

.picker-view {
  height: 80rpx;
  display: flex;
  align-items: center;
}

.dark-mode .input,
.dark-mode .textarea,
.dark-mode .picker-view {
  background-color: #3a3a3a;
  color: #fff;
}

.result-box {
  margin-top: 40rpx;
  padding: 30rpx;
  background-color: #fff799f5; /* Light Yellow for results */
  border-radius: 20rpx;
  border: none;
}

.dark-mode .result-box {
  background-color: #444;
}

.result-title {
  font-size: 30rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #f57f17; /* Darker yellow/orange */
  display: block;
}

.audio-player {
  margin: 30rpx 0;
  width: 100%;
}

.btn.small {
  width: auto;
  display: inline-block;
  padding: 0 40rpx;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 26rpx;
  background-color: #b3e5fc; /* Light Blue */
  color: #0277bd;
  border-radius: 35rpx;
}

.result-link {
  font-size: 26rpx;
  color: #0277bd;
  text-decoration: none;
  margin-top: 20rpx;
  display: block;
  text-align: center;
}

.result-content-scroll {
  max-height: 400rpx;
}

.result-content {
  font-size: 28rpx;
  color: #444;
  line-height: 1.6;
  word-break: break-all;
}

.result-image {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.result-video {
  width: 100%;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
}

.link-box {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #e3f2fd;
  border-radius: 12rpx;
  text-align: center;
}

.link-text {
  font-size: 26rpx;
  color: #555;
  margin-right: 10rpx;
}

.play-btn-circle {
  width: 35rpx;
  height: 35rpx;
  border-radius: 50%;
  background-color: #f57f17;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(245, 127, 23, 0.3);
}

.play-icon-triangle {
  width: 0;
  height: 0;
  border-top: 10rpx solid transparent;
  border-bottom: 10rpx solid transparent;
  border-left: 20rpx solid #ffffff;
  margin-left: 6rpx;
}

.copy-btn-circle {
  width: 35rpx;
  height: 35rpx;
  border-radius: 50%;
  background-color: #f57f17;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 10rpx rgba(255, 112, 67, 0.3);
}

.copy-icon {
  width: 8rpx;
  height: 8rpx;
  border: 2rpx solid #fff;
  position: relative;
  margin-right: 4rpx;
  margin-bottom: 4rpx;
}

.copy-icon::before {
  content: '';
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  border: 1rpx solid #fff;
  top: -2rpx;
  right: -6rpx;
}

/* Dark Mode Overrides */
.dark-mode.detail-container {
  background-color: #121212;
}
.dark-mode .detail-title { color: #fff; }
.dark-mode .detail-desc { color: #aaa; }
.dark-mode .detail-category { background-color: #333; color: #888; }
.dark-mode .label { color: #ccc; }
</style>