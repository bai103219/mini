import { ref } from 'vue';

export const currentTheme = ref('light');

export const initTheme = () => {
    const saved = uni.getStorageSync('app_theme');
    if (saved) {
        currentTheme.value = saved;
    }
    updateNativeUI();
};

export const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
    uni.setStorageSync('app_theme', currentTheme.value);
    updateNativeUI();
};

export const updateNativeUI = () => {
    if (currentTheme.value === 'dark') {
        uni.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#1a1a1a'
        });
        uni.setTabBarStyle({
            backgroundColor: '#1a1a1a',
            color: '#888888',
            selectedColor: '#ffffff',
            borderStyle: 'black'
        });
        if (typeof uni.setBackgroundColor === 'function') {
            uni.setBackgroundColor({
                backgroundColor: '#121212'
            });
        }
    } else {
        uni.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#ffffff'
        });
        uni.setTabBarStyle({
            backgroundColor: '#ffffff',
            color: '#999999',
            selectedColor: '#007AFF',
            borderStyle: 'white'
        });
        if (typeof uni.setBackgroundColor === 'function') {
            uni.setBackgroundColor({
                backgroundColor: '#F8F8F8'
            });
        }
    }
};
