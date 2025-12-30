<template>
  <view class="list-container" :class="{ 'dark-mode': currentTheme === 'dark' }">
    <!-- Add Button Row -->
    <view class="add-row" @tap="openAddModal">
      <text class="add-icon">+</text>
      <text class="add-text">添加新项目</text>
    </view>

    <!-- 列表 -->
    <view class="item-list">
      <view v-if="filteredList.length > 0">
        <view class="list-item" v-for="item in filteredList" :key="item.id" @tap="goToDetail(item.id)" @longpress="handleLongPress(item)">
          <image :src="item.icon" class="item-icon" mode="aspectFit"></image>
          <view class="item-content">
            <text class="item-title">{{ item.name }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>
      </view>
      <!-- 扩展功能：空状态 -->
      <view class="empty-state" v-else>
        <text>该分类下暂无内容</text>
      </view>
    </view>

    <!-- Add Modal -->
    <view class="modal-mask" v-if="showAddModal" @tap="closeAddModal">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">添加新项目</view>
        <view class="form-item">
          <text class="label">名称</text>
          <input class="input" v-model="newItem.name" placeholder="请输入名称" />
        </view>
        <view class="form-item">
          <text class="label">描述</text>
          <input class="input" v-model="newItem.description" placeholder="请输入描述" />
        </view>
        <view class="form-item">
          <text class="label">官网链接</text>
          <input class="input" v-model="newItem.url" placeholder="请输入URL" />
        </view>
        <view class="form-item">
            <text class="label">图标</text>
            <view class="icon-selector">
                <image :src="newItem.icon" class="preview-icon" mode="aspectFit" @tap="chooseIcon"></image>
                <text class="tip" @tap="chooseIcon">点击加载</text>
            </view>
        </view>
        <view class="modal-footer">
          <button class="btn cancel" @tap="closeAddModal">取消</button>
          <button class="btn confirm" @tap="confirmAdd">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onTabItemTap } from '@dcloudio/uni-app';
import { currentTheme } from '@/common/theme.js';
import { getAIModels, addAIModel, deleteAIModel, isSystemItem } from '@/common/data.js';

const allAIModels = ref([]);
const currentCategory = ref('all');
const showAddModal = ref(false);
const newItem = ref({
  name: '',
  description: '',
  url: '',
  icon: '/static/logo.png', // Default icon
  category: ''
});

// 点击 TabBar 时触发
onTabItemTap(() => {
  currentCategory.value = 'special';
  uni.setStorageSync('currentCategory', 'special');
});

// 每次页面显示时，都从缓存读取分类参数
onShow(() => {
  const category = uni.getStorageSync('currentCategory');
  if (category) {
    currentCategory.value = category;
  }
  // Load data from common/data.js
  allAIModels.value = getAIModels();
});

// 使用计算属性根据分类筛选列表
const filteredList = computed(() => {
  if (currentCategory.value === 'all') {
    return allAIModels.value.filter(item => item.category !== 'special');
  }
  return allAIModels.value.filter(item => item.category === currentCategory.value);
});

// 跳转到详情页
const goToDetail = (id) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${id}`
  });
};

// 长按删除
const handleLongPress = (item) => {
  if (isSystemItem(item.id)) {
    return uni.showToast({ title: '系统预置项不可删除', icon: 'none' });
  }
  
  uni.showModal({
    title: '确认删除',
    content: `确定要删除 "${item.name}" 吗？`,
    success: (res) => {
      if (res.confirm) {
        allAIModels.value = deleteAIModel(item.id);
        uni.showToast({ title: '删除成功', icon: 'none' });
      }
    }
  });
};

// Add Modal Logic
const openAddModal = () => {
  newItem.value = {
    name: '',
    description: '',
    url: '',
    icon: '/static/logo.png',
    category: currentCategory.value === 'all' ? 'dialogue' : currentCategory.value // Default to dialogue if all, else current
  };
  showAddModal.value = true;
};

const closeAddModal = () => {
  showAddModal.value = false;
};

const chooseIcon = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      newItem.value.icon = res.tempFilePaths[0];
    }
  });
};

const confirmAdd = () => {
  if (!newItem.value.name) {
    uni.showToast({ title: '请输入名称', icon: 'none' });
    return;
  }
  
  // Add to data
  const addedList = addAIModel({ ...newItem.value });
  allAIModels.value = addedList;
  
  uni.showToast({ title: '添加成功', icon: 'success' });
  closeAddModal();
};
</script>

<style scoped>
.list-container { padding: 20rpx; background-color: #f5f5f5; min-height: 100vh; }
.list-item { display: flex; align-items: center; background-color: #fff; padding: 25rpx; margin-bottom: 20rpx; border-radius: 16rpx; }
.item-icon { width: 85rpx; height: 85rpx; margin-right: 15rpx; border-radius: 20rpx; }
.item-content { display: flex; flex-direction: column; }
.item-title { font-size: 32rpx; font-weight: 600; margin-bottom: 8rpx; }
.item-desc { font-size: 26rpx; color: #888; }
.empty-state { display: flex; justify-content: center; align-items: center; height: 50vh; color: #999; }

/* Add Button Styles */
.add-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  border: 2rpx dashed #ccc;
}
.add-icon {
  font-size: 40rpx;
  margin-right: 10rpx;
  color: #666;
}
.add-text {
  font-size: 30rpx;
  color: #666;
}

/* Modal Styles */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.modal-content {
  width: 80%;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
}
.modal-header {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}
.form-item {
  margin-bottom: 20rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}
.input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
}
.icon-selector {
    display: flex;
    align-items: center;
}
.preview-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 10rpx;
    background-color: #f5f5f5;
    margin-right: 20rpx;
}
.tip {
    font-size: 24rpx;
    color: #007aff;
}
.modal-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
}
.btn {
  width: 45%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 10rpx;
  font-size: 30rpx;
}
.cancel {
  background-color: #f5f5f5;
  color: #666;
}
.confirm {
  background-color: #007aff;
  color: #fff;
}
</style>