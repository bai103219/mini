<template>
  <view class="container" :class="{ 'dark-mode': currentTheme === 'dark' }">
    <!-- RenderJS 交互触发器 -->
    <view :prop="videoProcessData" :change:prop="renderScript.generatePoster" class="renderjs-trigger" style="display:none;"></view>
    <view :prop="filePickerData" :change:prop="renderScript.pickFile" class="renderjs-file-trigger" style="display:none;"></view>

    <!-- 顶部背景图 -->
    <view class="header-bg" @tap="changeBg">
      <image :src="userInfo.bgImage" mode="aspectFill" class="bg-image"></image>
      <view class="bg-tip">点击更换背景</view>
    </view>

    <!-- 个人信息区域 -->
    <view class="user-info-section">
      <view class="info-wrapper">
        <!-- 头像 -->
        <view class="avatar-container" @tap="changeAvatar">
          <image :src="userInfo.avatar" mode="aspectFill" class="avatar"></image>
          <view class="avatar-tip">更换</view>
        </view>
        <!-- 名字和ID -->
        <view class="text-info">
          <text class="username">{{ userInfo.name }}</text>
          <text class="userid">mini：{{ userInfo.douyinId }}</text>
        </view>
      </view>
      
      <view class="bio">
        <text>热爱生活，热爱AI。分享我的AI创作作品。</text>
      </view>
      
    </view>

    <!-- 作品展示区域 -->
    <view class="works-section">
      <view class="tabs">
        <view class="tab-item active">作品</view>
      </view>
      
      <!-- 上传操作栏 -->
      <view class="action-bar">
        <view class="action-btn" @tap="uploadImage">
          <text class="action-icon">📷</text>
          <text class="action-text">图片</text>
        </view>
        <view class="action-btn" @tap="uploadVideo">
          <text class="action-icon">🎥</text>
          <text class="action-text">视频</text>
        </view>
        
        <!-- #ifdef H5 || APP-PLUS -->
        <!--
        <view class="action-btn" @tap="uploadFile('audio')">
          <text class="action-icon">🎵</text>
          <text class="action-text">音乐</text>
        </view>
        <view class="action-btn" @tap="uploadFile('file')">
          <text class="action-icon">📄</text>
          <text class="action-text">文档</text>
        </view>
        -->
        
        <!-- #endif -->
      </view>
      
      <view class="works-grid">
        <view class="work-item" v-for="(item, index) in worksList" :key="index" @longpress="deleteWork(index)">
          <!-- 图片 -->
          <image v-if="item.type === 'image'" :src="item.url" mode="aspectFill" class="work-image" @tap="previewImage(item.url)"></image>
          
          <!-- 视频 -->
          <view v-else-if="item.type === 'video'" class="work-content video-content" @tap="playVideo(item.url)">
             <image v-if="item.poster" :src="item.poster" mode="aspectFill" class="work-image"></image>
             <view class="video-overlay">
                <view class="play-icon"></view>
             </view>
          </view>
          
          <!-- 音频 -->
          <view v-else-if="item.type === 'audio'" class="work-content audio-content" @tap="playAudio(item.url)">
             <image v-if="item.poster" :src="item.poster" mode="aspectFill" class="work-image"></image>
             <view class="video-overlay" v-if="item.poster">
                <view class="bottom-info">
                    <text class="type-icon-small">🎵</text>
                    <text class="file-name-bottom">{{ item.name || '音频' }}</text>
                </view>
             </view>
             <template v-else>
                <text class="type-icon">🎵</text>
                <text class="file-name">{{ item.name || '音频' }}</text>
             </template>
          </view>
          
          <!-- 文档 -->
          <view v-else class="work-content file-content" @tap="openFile(item.url)">
             <image v-if="item.poster" :src="item.poster" mode="aspectFill" class="work-image"></image>
             <view class="video-overlay" v-if="item.poster">
                <view class="bottom-info">
                    <text class="type-icon-small">📄</text>
                    <text class="file-name-bottom">{{ item.name || '文档' }}</text>
                </view>
             </view>
             <template v-else>
                <text class="type-icon">📄</text>
                <text class="file-name">{{ item.name || '文档' }}</text>
             </template>
          </view>
          
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { currentTheme } from '@/common/theme.js';

// 用户信息
const userInfo = ref({
  name: 'AI创作者',
  douyinId: '888888',
  avatar: '/static/touxiang.png', // 默认头像
  bgImage: '/static/beijing.jpg'   // 默认背景
});

// 作品列表
const worksList = ref([]);

// 页面显示时读取缓存
onShow(() => {
  const storedAvatar = uni.getStorageSync('user_avatar');
  const storedBg = uni.getStorageSync('user_bg');
  const storedWorks = uni.getStorageSync('user_works');
  
  if (storedAvatar) userInfo.value.avatar = storedAvatar;
  if (storedBg) userInfo.value.bgImage = storedBg;
  
  const defaultWorks = [
    { type: 'image', url: '/static/chuan.jpg' },
    { type: 'image', url: '/static/qiao.jpg' },
    { type: 'image', url: '/static/shan.png' }
  ];

  let currentWorks = [];
  if (Array.isArray(storedWorks)) {
      currentWorks = storedWorks;
  }

  // 确保默认作品始终存在
  const existingUrls = new Set(currentWorks.map(w => w.url));
  const missingDefaults = defaultWorks.filter(w => !existingUrls.has(w.url));
  
  // 将缺失的默认作品添加到列表末尾
  worksList.value = [...currentWorks, ...missingDefaults];
});

// 保存作品列表到缓存
const saveWorks = () => {
  uni.setStorageSync('user_works', worksList.value);
};

// 保存文件到 production 目录
const saveToProduction = (tempFilePath, fileName) => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    plus.io.resolveLocalFileSystemURL('_doc/', (root) => {
      root.getDirectory('production', { create: true }, (dirEntry) => {
        plus.io.resolveLocalFileSystemURL(tempFilePath, (tempEntry) => {
          const targetName = fileName || tempEntry.name;
          tempEntry.moveTo(dirEntry, targetName, (finalEntry) => {
            resolve(finalEntry.fullPath);
          }, reject);
        }, reject);
      }, reject);
    }, reject);
    // #endif

    // #ifndef APP-PLUS
    uni.saveFile({
      tempFilePath: tempFilePath,
      success: (res) => resolve(res.savedFilePath),
      fail: reject
    });
    // #endif
  });
};

// 上传图片
const uploadImage = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      
      // #ifdef H5
      // H5 不支持 saveFile，直接使用临时路径（Blob URL）
      // 注意：H5 刷新后 Blob URL 会失效，这里仅做演示。
      // 若需持久化，需上传到服务器或转 Base64 存 Storage (有大小限制)
      worksList.value.unshift({
        type: 'image',
        url: tempFilePath
      });
      saveWorks();
      uni.showToast({ title: '上传成功', icon: 'success' });
      // #endif

      // #ifndef H5
      saveToProduction(tempFilePath).then((path) => {
        worksList.value.unshift({
          type: 'image',
          url: path
        });
        saveWorks();
        uni.showToast({ title: '上传成功', icon: 'success' });
      }).catch((err) => {
        console.error('保存失败', err);
        uni.showToast({ title: '保存失败', icon: 'none' });
      });
      // #endif
    }
  });
};

// 视频处理触发数据
const videoProcessData = ref(null);
// 文件选择触发数据
const filePickerData = ref(null);

// 保存 Base64 到本地文件 (App端)
const saveBase64ToLocal = (base64) => {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    const bitmap = new plus.nativeObj.Bitmap('video_thumb_' + Date.now());
    bitmap.loadBase64Data(base64, () => {
      const fileName = '_doc/thumb_' + Date.now() + '.jpg';
      bitmap.save(fileName, { overwrite: true, format: 'jpg', quality: 50 }, (i) => {
        bitmap.clear();
        resolve(i.target);
      }, (e) => {
        bitmap.clear();
        reject(e);
      });
    }, (e) => {
      bitmap.clear();
      reject(e);
    });
    // #endif
    // #ifndef APP-PLUS
    resolve(base64);
    // #endif
  });
};

// 保存视频作品
const saveVideoWork = (videoPath, posterPath) => {
    // #ifdef H5
    worksList.value.unshift({
        type: 'video',
        url: videoPath,
        poster: posterPath || '/static/video_cover_default.jpg'
    });
    saveWorks();
    uni.showToast({ title: '上传成功', icon: 'success' });
    // #endif

    // #ifndef H5
    uni.showLoading({ title: '保存中...' });
    saveToProduction(videoPath).then((savedVideoPath) => {
        if (posterPath && posterPath !== '/static/video_cover_default.jpg') {
            saveToProduction(posterPath).then((savedPosterPath) => {
                worksList.value.unshift({
                    type: 'video',
                    url: savedVideoPath,
                    poster: savedPosterPath
                });
                saveWorks();
                uni.hideLoading();
                uni.showToast({ title: '上传成功', icon: 'success' });
            }).catch(() => {
                // 封面保存失败，降级为默认
                worksList.value.unshift({
                    type: 'video',
                    url: savedVideoPath,
                    poster: '/static/video_cover_default.jpg'
                });
                saveWorks();
                uni.hideLoading();
                uni.showToast({ title: '上传成功(默认封面)', icon: 'success' });
            });
        } else {
            worksList.value.unshift({
                type: 'video',
                url: savedVideoPath,
                poster: '/static/video_cover_default.jpg'
            });
            saveWorks();
            uni.hideLoading();
            uni.showToast({ title: '上传成功', icon: 'success' });
        }
    }).catch((err) => {
        console.error(err);
        uni.hideLoading();
        uni.showToast({ title: '保存失败', icon: 'none' });
    });
    // #endif
};

// 手动选择封面兜底
const showManualCoverSelection = (videoPath) => {
    uni.showModal({
        title: '视频暂无封面',
        content: '没有封面，是否手动选择一张图片？',
        confirmText: '选择图片',
        cancelText: '使用默认',
        success: (modalRes) => {
            if (modalRes.confirm) {
                uni.chooseImage({
                    count: 1,
                    success: (imgRes) => {
                        saveVideoWork(videoPath, imgRes.tempFilePaths[0]);
                    },
                    fail: () => {
                        saveVideoWork(videoPath, null);
                    }
                });
            } else {
                saveVideoWork(videoPath, null);
            }
        }
    });
};

// 处理 RenderJS 返回的封面
const handleVideoProcessed = async (data) => {
    const { url, posterBase64, originalPath } = data;
    uni.hideLoading();
    
    const videoSourcePath = originalPath || url;

    if (posterBase64) {
        let finalPoster = posterBase64;
        // #ifdef APP-PLUS
        try {
            finalPoster = await saveBase64ToLocal(posterBase64);
        } catch (e) {
            console.error('保存封面失败', e);
            // 保存失败，尝试手动
            showManualCoverSelection(videoSourcePath);
            return;
        }
        // #endif
        
        saveVideoWork(videoSourcePath, finalPoster);
    } else {
        // 生成失败，手动选择
        showManualCoverSelection(videoSourcePath);
    }
};

// 保存通用 Base64 文件 (App端)
const saveBase64File = (base64, fileName) => {
    return new Promise((resolve, reject) => {
        // #ifdef APP-PLUS
        try {
            const arr = base64.split(',');
            const body = arr[1];
            const buffer = uni.base64ToArrayBuffer(body);
            
            plus.io.resolveLocalFileSystemURL('_doc/', (root) => {
                root.getDirectory('production', { create: true }, (dirEntry) => {
                    dirEntry.getFile(fileName, { create: true }, (fileEntry) => {
                        fileEntry.createWriter((writer) => {
                            writer.onwrite = () => {
                                resolve(fileEntry.fullPath);
                            };
                            writer.onerror = (e) => reject(e);
                            writer.write(buffer);
                        }, (e) => reject(e));
                    }, (e) => reject(e));
                }, (e) => reject(e));
            }, (e) => reject(e));
        } catch (e) {
            reject(e);
        }
        // #endif
        // #ifndef APP-PLUS
        resolve(base64);
        // #endif
    });
};

// 处理 RenderJS 返回的文件
const handleFileSelected = async (data) => {
    const { base64, name, type, filePath, isSaved } = data;
    
    // 如果既没有 base64 也没有 filePath，说明失败或取消
    if (!base64 && !filePath) {
        uni.hideLoading();
        return;
    }
    
    try {
        let finalPath = filePath;

        // 如果 RenderJS 没有直接保存文件 (例如 H5 或 fallback)，则在这里保存
        if (!isSaved && base64) {
            // #ifdef APP-PLUS
            finalPath = await saveBase64File(base64, name);
            // #endif
            // #ifndef APP-PLUS
            finalPath = base64;
            // #endif
        }
        
        worksList.value.unshift({
            type: type,
            url: finalPath,
            name: name
        });
        saveWorks();
        uni.hideLoading();
        uni.showToast({ title: '上传成功', icon: 'success' });
    } catch (e) {
        console.error('保存文件失败', e);
        uni.hideLoading();
        uni.showToast({ title: '保存失败', icon: 'none' });
    }
};

// 暴露给 RenderJS 调用
// 注意：在 Vue 3 <script setup> 中，顶层函数会自动暴露给模版和实例，
// 通常不需要手动挂载到 instance.proxy。如果遇到 callMethod 找不到方法的问题，
// 可以尝试使用 defineExpose
/*
onMounted(() => {
    const instance = getCurrentInstance();
    if (instance && instance.proxy) {
        // instance.proxy.handleVideoProcessed = handleVideoProcessed;
        // instance.proxy.handleFileSelected = handleFileSelected;
    }
});
*/
// 处理 RenderJS 开始读取文件
const handleFileReading = () => {
    uni.showLoading({ title: '读取文件中...' });
};

defineExpose({
    handleVideoProcessed,
    handleFileSelected,
    handleFileReading
});

// 上传视频
const uploadVideo = () => {
  uni.chooseVideo({
    sourceType: ['album', 'camera'],
    success: (res) => {
      let tempFilePath = res.tempFilePath;
      const thumbPath = res.thumbTempFilePath;

      // 1. 优先使用系统返回的封面
      if (thumbPath) {
          saveVideoWork(tempFilePath, thumbPath);
          return;
      }

      // 2. 如果没有系统封面，直接手动选择或使用默认
      // 跳过 RenderJS 自动生成，因为处理时间太长
      showManualCoverSelection(tempFilePath);
    },
    fail: () => {
        // 取消选择
    }
  });
};

// 上传文件 (音频/文档)
const uploadFile = (type) => {
  // #ifdef H5
  uni.chooseFile({
    count: 1,
    type: type === 'audio' ? 'image' : 'all', // H5端 type 参数有限，App端支持更好
    extension: type === 'audio' ? ['.mp3', '.wav', '.m4a'] : ['.pdf', '.doc', '.docx', '.txt'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      const fileName = res.tempFiles[0].name;
      
      worksList.value.unshift({
        type: type,
        url: tempFilePath,
        name: fileName
      });
      saveWorks();
      uni.showToast({ title: '上传成功', icon: 'success' });
    },
    fail: (err) => {
      console.error('选择文件失败', err);
    }
  });
  // #endif

  // #ifdef APP-PLUS
  // 移除这里的 showLoading，避免用户取消选择后 loading 不消失
  // uni.showLoading({ title: '准备选择...' });
  filePickerData.value = {
      type: type,
      _ts: Date.now()
  };
  // #endif
};

// 保存作品到相册
const saveWorkToAlbum = (item) => {
    // #ifdef H5
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.name || (item.type === 'video' ? 'video_' + Date.now() + '.mp4' : 'image_' + Date.now() + '.png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    uni.showToast({ title: '已触发下载', icon: 'success' });
    return;
    // #endif

    if (item.type === 'image') {
        uni.saveImageToPhotosAlbum({
            filePath: item.url,
            success: () => {
                uni.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: (err) => {
                console.error('保存图片失败', err);
                uni.showToast({ title: '保存失败', icon: 'none' });
            }
        });
    } else if (item.type === 'video') {
        uni.saveVideoToPhotosAlbum({
            filePath: item.url,
            success: () => {
                uni.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: (err) => {
                console.error('保存视频失败', err);
                uni.showToast({ title: '保存失败', icon: 'none' });
            }
        });
    } else if (item.type === 'audio' || item.type === 'file') {
        // #ifdef APP-PLUS
        if (plus.os.name === 'Android') {
            const downloadPath = '/storage/emulated/0/Download/';
            
            plus.io.resolveLocalFileSystemURL(item.url, (entry) => {
                plus.io.resolveLocalFileSystemURL(downloadPath, (dirEntry) => {
                    
                    // 原始文件名
                    let originalName = item.name || ('file_' + Date.now() + (item.type === 'audio' ? '.mp3' : '.txt'));
                    
                    // 递归查找可用文件名
                    const checkAndCopy = (nameToCheck, counter) => {
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
                                checkAndCopy(newName, counter + 1);
                            }, 
                            () => {
                                // 文件不存在，可以使用
                                entry.copyTo(dirEntry, nameToCheck, (newEntry) => {
                                    uni.showToast({ title: '已保存到下载目录', icon: 'success' });
                                }, (e) => {
                                    console.error('Copy failed', e);
                                    uni.showToast({ title: '保存失败', icon: 'none' });
                                });
                            }
                        );
                    };
                    
                    checkAndCopy(originalName, 1);

                }, (e) => {
                    console.error('Get Download dir failed', e);
                    uni.showToast({ title: '无法访问下载目录', icon: 'none' });
                });
            }, (e) => {
                console.error('Get source file failed', e);
                uni.showToast({ title: '文件不存在', icon: 'none' });
            });
        } else {
            uni.showToast({ title: 'iOS暂不支持直接保存到文件', icon: 'none' });
        }
        // #endif
    }
};

// 删除作品或更换封面
const deleteWork = (index) => {
  const item = worksList.value[index];
  const itemList = ['删除作品'];
  
  // #ifdef APP-PLUS || H5
  // 图片和视频允许保存到本地相册 (H5为下载)
  if (['image', 'video'].includes(item.type)) {
      itemList.unshift('保存到相册');
  }
  // #endif
  
  // 视频、音频、文档都允许更换封面
  if (['video', 'audio', 'file'].includes(item.type)) {
      itemList.unshift('更换封面');
  }
  
  // 音频和文档允许修改名称
  if (['audio', 'file'].includes(item.type)) {
      itemList.unshift('修改名称');
  }
  
  uni.showActionSheet({
      itemList: itemList,
      success: (res) => {
          const tapIndex = res.tapIndex;
          const action = itemList[tapIndex];
          
          if (action === '修改名称') {
              renameWork(index);
          } else if (action === '更换封面') {
              changeWorkCover(index);
          } else if (action === '删除作品') {
              confirmDelete(index);
          } else if (action === '保存到相册' || action === '保存到本地') {
              saveWorkToAlbum(item);
          }
      }
  });
};

const renameWork = (index) => {
    const item = worksList.value[index];
    uni.showModal({
        title: '修改名称',
        editable: true,
        placeholderText: '请输入新名称',
        content: item.name || '',
        success: (res) => {
            if (res.confirm && res.content) {
                worksList.value[index].name = res.content;
                saveWorks();
                uni.showToast({ title: '修改成功', icon: 'none' });
            }
        }
    });
};

const confirmDelete = (index) => {
    uni.showModal({
      title: '删除作品',
      content: '确定要删除这个作品吗？',
      success: (res) => {
        if (res.confirm) {
          worksList.value.splice(index, 1);
          saveWorks();
          uni.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
};

// 更换作品封面 (视频/音频/文档)
const changeWorkCover = (index) => {
    uni.chooseImage({
        count: 1,
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            // #ifdef APP-PLUS
            saveToProduction(tempFilePath).then((savedPath) => {
                worksList.value[index].poster = savedPath;
                saveWorks();
                uni.showToast({ title: '封面已更新', icon: 'success' });
            }).catch(() => {
                uni.showToast({ title: '保存失败', icon: 'none' });
            });
            // #endif
            
            // #ifndef APP-PLUS
            worksList.value[index].poster = tempFilePath;
            saveWorks();
            uni.showToast({ title: '封面已更新', icon: 'success' });
            // #endif
        }
    });
};

// 预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url]
  });
};

// 播放视频
const playVideo = (url) => {
  // 简单实现：跳转到视频播放页或全屏播放，这里仅做提示
  // 实际开发中可以使用 uni.navigateTo 跳转到专门的播放页
  uni.showToast({ title: '正在尝试播放视频...', icon: 'none' });
  // #ifdef APP-PLUS
  plus.runtime.openFile(url);
  // #endif
};

// 播放音频
const playAudio = (url) => {
  const innerAudioContext = uni.createInnerAudioContext();
  innerAudioContext.autoplay = true;
  innerAudioContext.src = url;
  innerAudioContext.onPlay(() => {
    uni.showToast({ title: '开始播放', icon: 'none' });
  });
  innerAudioContext.onError((res) => {
    uni.showToast({ title: '播放失败', icon: 'none' });
  });
};

// 打开文件
const openFile = (url) => {
  // #ifdef APP-PLUS
  // 使用内部 WebView 打开 (支持 X5 内核)
  let targetUrl = url;
  // 将相对路径转换为绝对路径
  if (url.startsWith('_doc/') || url.startsWith('_www/') || url.startsWith('_downloads/')) {
      targetUrl = plus.io.convertLocalFileSystemURL(url);
  }
  // 添加 file:// 前缀
  if (!targetUrl.startsWith('http') && !targetUrl.startsWith('file://') && targetUrl.startsWith('/')) {
      targetUrl = 'file://' + targetUrl;
  }
  
  uni.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent(targetUrl)
  });
  // #endif
  
  // #ifdef H5
  window.open(url);
  // #endif
  
  // #ifdef MP
  uni.openDocument({
    filePath: url,
    success: function () {
      console.log('打开文档成功');
    }
  });
  // #endif
};

// 更换头像
const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      userInfo.value.avatar = tempFilePath;
      uni.setStorageSync('user_avatar', tempFilePath);
      uni.showToast({ title: '头像已更新', icon: 'none' });
    }
  });
};

// 更换背景
const changeBg = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      userInfo.value.bgImage = tempFilePath;
      uni.setStorageSync('user_bg', tempFilePath);
      uni.showToast({ title: '背景已更新', icon: 'none' });
    }
  });
};
</script>

<style scoped>
.container {
  background-color: #ffffff;
  min-height: 100vh;
  color: #333333;
  transition: background-color 0.3s, color 0.3s;
}

.container.dark-mode {
  background-color: #161823;
  color: #ffffff;
}

/* 顶部背景 */
.header-bg {
  width: 100%;
  height: 320rpx;
  position: relative;
  background-color: #eee;
}
.dark-mode .header-bg {
  background-color: #333;
}

.bg-image {
  width: 100%;
  height: 100%;
}
.bg-tip {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(0,0,0,0.5);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: rgba(255,255,255,0.8);
  display: none;
}

/* 个人信息 */
.user-info-section {
  padding: 0 30rpx;
  position: relative;
  margin-bottom: 20rpx;
}

.info-wrapper {
  display: flex;
  align-items: flex-end; /* 底部对齐 */
  margin-top: -40rpx; /* 让头像部分重叠在背景上 */
  margin-bottom: 20rpx;
}

.avatar-container {
  position: relative;
  margin-right: 24rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #ffffff;
  background-color: #fff;
}

.dark-mode .avatar {
  border-color: #161823;
}

.avatar-tip {
  position: absolute;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0,0,0,0.6);
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
  display: none; /* 默认隐藏，点击触发 */
}

.text-info {
  display: flex;
  flex-direction: column;
  padding-bottom: 10rpx;
}

.username {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}

.userid {
  font-size: 24rpx;
  color: #666;
}
.dark-mode .userid {
  color: rgba(255,255,255,0.6);
}

.bio {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 30rpx;
  line-height: 1.4;
}
.dark-mode .bio {
  color: rgba(255,255,255,0.9);
}

.stats {
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: baseline;
}

.num {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 8rpx;
}

.label {
  font-size: 24rpx;
  color: #999;
}
.dark-mode .label {
  color: rgba(255,255,255,0.6);
}

/* 作品区域 */
.works-section {
  background-color: #ffffff;
  border-top: 1rpx solid #eee;
}
.dark-mode .works-section {
  background-color: #161823;
  border-top: 1rpx solid rgba(255,255,255,0.1);
}

.tabs {
  display: flex;
  height: 88rpx;
  align-items: center;
  justify-content: center; /* 居中或者 space-around */
  gap: 60rpx;
  margin-bottom: 2rpx;
}

.tab-item {
  font-size: 30rpx;
  color: #999;
  position: relative;
  padding: 20rpx 0;
}
.dark-mode .tab-item {
  color: rgba(255,255,255,0.6);
}

.tab-item.active {
  color: #333;
  font-weight: bold;
  background-color: #9ed5f8fe;
  padding: 10rpx 320rpx;
  border-radius: 20rpx;
}
.dark-mode .tab-item.active {
  color: #ffffff;
}

/* .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #face15; 
  border-radius: 2rpx;
} */

.works-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rpx;
}

.work-item {
  position: relative;
  padding-bottom: 133%; /* 3:4 比例 */
  background-color: #f0f0f0;
}
.dark-mode .work-item {
  background-color: #333;
}

.work-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.1); /* 再次调淡遮罩，让封面更亮 */
  color: #fff;
}

.play-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2rpx solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
}

.play-icon::after {
  content: '';
  display: block;
  width: 0;
  height: 0;
  border-top: 16rpx solid transparent;
  border-bottom: 16rpx solid transparent;
  border-left: 26rpx solid rgba(255, 255, 255, 0.9);
  margin-left: 8rpx;
}

.work-likes {
  position: absolute;
  bottom: 10rpx;
  left: 10rpx;
  font-size: 24rpx;
  color: #fff;
  display: flex;
  align-items: center;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.like-icon {
  margin-right: 6rpx;
}

/* 操作栏样式 */
.action-bar {
  display: flex;
  justify-content: center;
  gap: 200rpx;
  padding: 20rpx 0;
  background-color: #fff;
  margin-bottom: 10rpx;
}
.dark-mode .action-bar {
  background-color: #161823;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 24rpx;
  color: #666;
}
.dark-mode .action-btn {
  color: #ccc;
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

/* 作品内容样式 */
.work-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.video-content {
  background-color: #000;
}

.audio-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.file-content {
  background-color: #f5f5f5;
  color: #333;
}
.dark-mode .file-content {
  background-color: #444;
  color: #fff;
}

.type-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.file-name {
  font-size: 24rpx;
  padding: 0 10rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 90%;
}

/* 底部信息样式 (有封面时) */
.bottom-info {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10rpx;
}

.type-icon-small {
  font-size: 28rpx;
  margin-right: 8rpx;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
}

.file-name-bottom {
  font-size: 24rpx;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80%;
}

.delete-tip {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  display: none;
}

.work-item:active .delete-tip {
  display: block;
}
</style>

<script module="renderScript" lang="renderjs">
export default {
  methods: {
    generatePoster(newValue, oldValue, ownerInstance, instance) {
      if (!newValue || !newValue.url) return;
      
      const url = newValue.url;
      const originalPath = newValue.originalPath;
      
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.autoplay = true; 
      video.setAttribute('playsinline', 'true'); // iOS必须
      video.setAttribute('webkit-playsinline', 'true');
      
      const timer = setTimeout(() => {
          // 超时返回空
          ownerInstance.callMethod('handleVideoProcessed', { url: url, originalPath: originalPath, posterBase64: null });
      }, 5000);

      // 1. 监听元数据加载，获取时长并随机跳转
      video.onloadedmetadata = () => {
          if (video.duration && Number.isFinite(video.duration) && video.duration > 0) {
              // 随机截取 0 到 1秒 之间的一帧 (如果视频短于1秒，则在时长范围内)，保证快速
              const maxTime = Math.min(video.duration, 1.0);
              const randomTime = Math.random() * maxTime;
              video.currentTime = randomTime;
          } else {
              // 获取不到时长，默认取第0.1秒
              video.currentTime = 0.1;
          }
      };

      // 2. 监听 seeked 事件，确保画面已跳转并渲染完毕
      video.onseeked = () => {
          clearTimeout(timer);
          try {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 300;
              canvas.height = video.videoHeight || 200;
              canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              
              // 避免重复触发
              video.onseeked = null;
              video.pause();
              
              ownerInstance.callMethod('handleVideoProcessed', { url: url, originalPath: originalPath, posterBase64: dataUrl });
          } catch(e) {
              console.error('RenderJS生成封面错误', e);
              ownerInstance.callMethod('handleVideoProcessed', { url: url, originalPath: originalPath, posterBase64: null });
          }
      };
      
      video.onerror = (e) => {
          clearTimeout(timer);
          console.error('RenderJS视频加载错误', e);
          ownerInstance.callMethod('handleVideoProcessed', { url: url, originalPath: originalPath, posterBase64: null });
      };

      // 最后设置 src 开始加载
      video.src = url;
    },
    
    pickFile(newValue, oldValue, ownerInstance, instance) {
        if (!newValue) return;
        const type = newValue.type;
        
        // 移除旧的 input，确保每次都是新的
        let oldInput = document.getElementById('renderjs-file-input');
        if (oldInput) {
            document.body.removeChild(oldInput);
        }
        
        let input = document.createElement('input');
        input.type = 'file';
        input.id = 'renderjs-file-input';
        input.style.display = 'none';
        // 统一使用 */* 以兼容所有安卓机型的文件选择器
        input.accept = '*/*'; 
        document.body.appendChild(input);
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) {
                ownerInstance.callMethod('handleFileSelected', { base64: null });
                return;
            }
            
            // 通知逻辑层开始读取
            ownerInstance.callMethod('handleFileReading', {});
            
            // 限制大小，例如 50MB
            if (file.size > 50 * 1024 * 1024) {
                alert('文件太大，请选择小于50MB的文件');
                ownerInstance.callMethod('handleFileSelected', { base64: null });
                return;
            }

            // 校验文件类型
            const fileName = file.name.toLowerCase();
            if (type === 'audio') {
                const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];
                const isValid = validExtensions.some(ext => fileName.endsWith(ext));
                if (!isValid) {
                    alert('请选择音频文件 (.mp3, .wav, .m4a, etc.)');
                    ownerInstance.callMethod('handleFileSelected', { base64: null });
                    return;
                }
            } else {
                const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.ppt', '.pptx'];
                const isValid = validExtensions.some(ext => fileName.endsWith(ext));
                if (!isValid) {
                    alert('请选择文档文件 (.pdf, .doc, .docx, .txt, etc.)');
                    ownerInstance.callMethod('handleFileSelected', { base64: null });
                    return;
                }
            }

            // 尝试在 RenderJS 中直接保存文件 (仅 App 端)
            let usePlus = false;
            try {
                usePlus = (typeof plus !== 'undefined' && plus.io);
            } catch (e) {
                console.error('Check plus error', e);
            }

            if (usePlus) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    try {
                        const parts = base64.split(',');
                        const body = parts[1];
                        const binary_string = window.atob(body);
                        const len = binary_string.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binary_string.charCodeAt(i);
                        }
                        const buffer = bytes.buffer;

                        plus.io.resolveLocalFileSystemURL('_doc/', (root) => {
                            root.getDirectory('production', { create: true }, (dirEntry) => {
                                const fileName = Date.now() + '_' + file.name;
                                dirEntry.getFile(fileName, { create: true }, (fileEntry) => {
                                    fileEntry.createWriter((writer) => {
                                        writer.onwrite = () => {
                                            ownerInstance.callMethod('handleFileSelected', {
                                                filePath: fileEntry.fullPath,
                                                name: file.name,
                                                type: type,
                                                isSaved: true
                                            });
                                        };
                                        writer.onerror = (e) => {
                                            console.error('RenderJS Write Error', e);
                                            ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                                        };
                                        writer.write(buffer);
                                    }, (e) => {
                                        console.error('RenderJS CreateWriter Error', e);
                                        ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                                    });
                                }, (e) => {
                                    console.error('RenderJS GetFile Error', e);
                                    ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                                });
                            }, (e) => {
                                console.error('RenderJS GetDirectory Error', e);
                                ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                            });
                        }, (e) => {
                            console.error('RenderJS ResolveFS Error', e);
                            ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                        });
                    } catch (e) {
                        console.error('RenderJS Save Error', e);
                        ownerInstance.callMethod('handleFileSelected', { base64: base64, name: file.name, type: type });
                    }
                };
                reader.onerror = () => {
                    ownerInstance.callMethod('handleFileSelected', { base64: null });
                };
                reader.readAsDataURL(file);
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    ownerInstance.callMethod('handleFileSelected', {
                        base64: base64,
                        name: file.name,
                        type: type
                    });
                };
                reader.onerror = () => {
                    ownerInstance.callMethod('handleFileSelected', { base64: null });
                };
                reader.readAsDataURL(file);
            }
        };
        
        input.click();
    }
  }
}
</script>