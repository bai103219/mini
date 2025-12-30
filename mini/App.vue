<script>
	import { initTheme } from './common/theme.js';
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			initTheme();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	/* Dark Mode Global Styles */
	.dark-mode {
		background-color: #201e1eff !important;
		color: #e0e0e0 !important;
		min-height: 100vh;
	}
	
	.dark-mode .container,
	.dark-mode .list-container,
	.dark-mode .about-container {
		background-color: #cdc9c9ff !important;
	}
	
	.dark-mode .category-section,
	.dark-mode .recommend-section,
	.dark-mode .list-item,
	.dark-mode .info-section {
		background-color: #b6b3b36d !important;
		color: #e0e0e0 !important;
	}
	
	.dark-mode .section-title,
	.dark-mode .item-title,
	.dark-mode .info-title,
	.dark-mode .category-name,
	.dark-mode .recommend-name {
		color: #ffffff !important;
	}
	
	.dark-mode .item-desc,
	.dark-mode .info-content {
		color: #aaaaaa !important;
	}
</style>
