<template>
  <view class="container" :class="{ 'dark-mode': currentTheme === 'dark' }">
    <!-- 1. 轮播图 -->
    <swiper class="banner" indicator-dots autoplay circular interval="3000">
      <swiper-item v-for="item in bannerList" :key="item.id">
        <image :src="item.img" class="banner-img" mode="aspectFill"></image>
      </swiper-item>
    </swiper>

    <!-- 2. 分类导航 -->
    <view class="category-section">
      <view class="section-header">
        <view class="section-title">功能分类</view>
        <view class="theme-toggle" @tap="toggleTheme">
          <text>{{ currentTheme === 'light' ? '🌙 夜间' : '☀️ 日间' }}</text>
        </view>
      </view>
      <view class="category-grid">
        <view class="category-item" v-for="cat in categoryList" :key="cat.type" @tap="goToList(cat.type)">
          <image :src="cat.icon" class="category-icon" mode="aspectFit"></image>
          <text class="category-name">{{ cat.name }}</text>
        </view>
      </view>
    </view>

    <!-- 3.好用推荐 -->
    <view class="recommend-section">
      <view class="section-title">好用推荐</view>
      <view class="recommend-grid">
        <view class="recommend-item" v-for="item in recommendList" :key="item.id" @tap="openUrl(item.url)">
          <image :src="item.icon" class="recommend-icon" mode="aspectFit"></image>
          <text class="recommend-name">{{ item.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { currentTheme, toggleTheme } from '@/common/theme.js';

// 轮播图数据
const bannerList = ref([
  { id: 'doubao', img: '/static/doubao.png' },
  { id: 'kimi',    img: '/static/kimi.jpg' },
  { id: 'deepseek', img: '/static/deepseek.jpg' }
]);

// 分类导航数据
const categoryList = ref([
  { name: '全部', type: 'all', icon: '/static/all.png' },
  { name: '智能对话', type: 'dialogue', icon: '/static/dailog.png' },
  { name: '图像生成', type: 'image', icon: '/static/picture.png' },
  { name: '代码开发', type: 'code', icon: '/static/txt.png' },
  { name: '视频生成', type: 'video', icon: '/static/video.png' },
  { name: '智能办公', type: 'office', icon: '/static/work.png' },
  { name: '音频处理', type: 'audio', icon: '/static/7.png' },
  { name: '行业方案', type: 'scheme', icon: '/static/8.png' }
  
]);

// 跳转到列表页
const goToList = (categoryType) => {
  // 因为列表页是 TabBar 页面，不能用 navigateTo 传参
  // 先将参数存入本地存储
  uni.setStorageSync('currentCategory', categoryType);
  // 然后切换 Tab
  uni.switchTab({
    url: '/pages/list/list'
  });
};

// 热门推荐数据
const recommendList = ref([
  { id: 'metaso', name: '豆包', icon: '/static/doubao_tx.png', url: 'https://www.doubao.com/chat/' },
  { id: 'spark', name: '星火', icon: '/static/xinhuo.webp', url: 'https://xinghuo.xfyun.cn/desk' },
  { id: 'qianwen', name: '千问', icon: '/static/qianwen.webp', url: 'https://www.qianwen.com/' }
]);

// 打开外部链接
const openUrl = (url) => {
  // #ifdef H5
  window.location.href = url;
  // #endif
  
  // #ifdef APP-PLUS
  // 使用内部 WebView 打开 (支持 X5 内核)
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
</script>

// ... existing code ...
<style scoped>
.container {
  background-color: #f4f6f9;
  min-height: 100vh;
}

/* ---------- 轮播图 ---------- */
.banner {
  width: 100%;
  height: 350rpx;
  padding: 20rpx;
  box-sizing: border-box;
}
.banner-img {
  width: 100%;
  height: 100%;
  border-radius: 25rpx;
}

/* ---------- 分类导航 (已修复) ---------- */
.category-section {
  margin: 20rpx;
  padding: 30rpx; /* 在外层容器上设置内边距，确保整体有边距 */
  background-color: #fff;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  /* margin-bottom: 30rpx; Removed as it is now on header */
}

.theme-toggle {
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.dark-mode .theme-toggle {
  background-color: #333;
  color: #fff;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4列，每列等宽 */
  gap: 20rpx; /* 统一设置行和列的间距，可以适当调整 */
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx;
}

.category-name {
  font-size: 26rpx;
  color: #333;
}

/* ---------- 热门推荐 ---------- */
.recommend-section {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
}

.recommend-section .section-title {
  margin-bottom: 20rpx;
}

.recommend-grid {
  display: flex;
  justify-content: space-around; /* 平均分布 */
}

.recommend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.recommend-icon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 16rpx;
  border-radius: 20rpx; /* 圆角图标 */
}

.recommend-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}
</style>