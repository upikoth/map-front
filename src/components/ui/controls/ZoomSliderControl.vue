<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { PropType } from 'vue';

import View from 'ol/View';

const props = defineProps({
	maxZoom: {
		type: Number as PropType<number>,
	},
	minZoom: {
		type: Number as PropType<number>,
	},
	zoom: {
		type: Number as PropType<number>,
	},
	mapView: {
		type: Object as PropType<View>,
	},
});

const zoom = ref(props.zoom || 0);

watch(() => props.mapView, subscribeZoom);

onMounted(() => {
	subscribeZoom();
});

function subscribeZoom(): void {
	if (!props.mapView) {
		return;
	}

	props.mapView.on('change:resolution', () => {
		zoom.value = Number(props.mapView?.getZoom()?.toFixed(2)) || 0;
	});
}

function handleControlZoomChange(newZoomValue: number): void {
	zoom.value = newZoomValue;
	props.mapView?.setZoom(zoom.value);
}
</script>

<template>
	<q-slider
		:model-value="zoom"
		:min="props.minZoom"
		:max="props.maxZoom"
		color="primary"
		:step="0.01"
		vertical
		reverse
		@update:model-value="handleControlZoomChange"
	/>
</template>

<style scoped lang="stylus">
.q-slider
	position absolute
	left 17px
	top 100px
</style>
