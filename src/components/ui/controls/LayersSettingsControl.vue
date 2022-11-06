<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';

import TileLayer from 'ol/layer/Tile';

import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps';

const props = defineProps({
	osmLayer: {
		type: Object as PropType<TileLayer<XYZ>>,
		required: true,
	},
	bingLayer: {
		type: Object as PropType<TileLayer<BingMaps>>,
		required: true,
	},
});

const isOsmLayerVisible = ref(props.osmLayer.getVisible());
const isBingLayerVisible = ref(props.bingLayer.getVisible());
const osmOpacity = ref(0);

watch(
	() => isOsmLayerVisible.value,
	() => {
		props.osmLayer.setVisible(isOsmLayerVisible.value);
	}
);

watch(
	() => isBingLayerVisible.value,
	() => {
		props.bingLayer.setVisible(isBingLayerVisible.value);
	}
);

watch(
	() => osmOpacity.value,
	() => {
		props.osmLayer.setOpacity((100 - osmOpacity.value) / 100);
	}
);
</script>

<template>
	<q-btn
		round
		color="primary"
		icon="layers"
	>
		<q-menu :style="{ 'min-width': '300px' }">
			<q-list>
				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="isBingLayerVisible"
							label="Спутник"
						/>
					</q-item-section>
				</q-item>
				<q-item>
					<q-item-section :style="{ 'max-width': '110px' }">
						<q-checkbox
							v-model="isOsmLayerVisible"
							label="Схема"
						/>
					</q-item-section>
					<q-item-section>
						<q-badge
							:style="{ 'max-width': 'max-content' }"
							transparent
						>
							Прозрачность: {{ osmOpacity }}
						</q-badge>
						<q-slider
							v-model="osmOpacity"
							:min="0"
							:max="100"
							:disable="!isOsmLayerVisible"
						/>
					</q-item-section>
				</q-item>
				<slot name="layers-control" />
			</q-list>
		</q-menu>
	</q-btn>
</template>

<style scoped lang="stylus">
.q-btn
	position absolute
	left 10px
	top 10px
</style>
