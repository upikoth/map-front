<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { PropType } from 'vue';

const props = defineProps({
	mapElement: {
		type: Object as PropType<HTMLDivElement>,
	},
});

const isFullScreen = ref(false);

onMounted(() => {
	document.addEventListener('fullscreenchange', () => {
		const isDisplayWithFullScreen = !!document.fullscreenElement;

		isFullScreen.value = isDisplayWithFullScreen;
	});
});

watch(
	() => isFullScreen.value,
	() => {
		const isDisplayWithFullScreen = !!document.fullscreenElement;

		if (isFullScreen.value && !isDisplayWithFullScreen) {
			props.mapElement?.requestFullscreen();
			return;
		}

		if (!isFullScreen.value && isDisplayWithFullScreen) {
			document.exitFullscreen();
			return;
		}
	}
);
</script>

<template>
	<q-btn
		round
		color="primary"
		:icon="isFullScreen ? 'close_fullscreen' : 'open_in_full'"
		@click="isFullScreen = !isFullScreen"
	/>
</template>

<style scoped lang="stylus">
.q-btn
	position absolute
	right 10px
	top 10px
</style>
