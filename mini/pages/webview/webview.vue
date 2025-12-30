<template>
  <view class="webview-container">
    <web-view :src="url" :webview-styles="webviewStyles"></web-view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const url = ref('');
const webviewStyles = ref({
    progress: {
        color: '#007AFF'
    }
});

onLoad((options) => {
    if (options.url) {
        // 解码 URL，防止参数丢失
        url.value = decodeURIComponent(options.url);
    }
});
</script>

<style>
.webview-container {
    width: 100%;
    height: 100%;
}
</style>