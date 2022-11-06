<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, watch } from 'vue';
import type { PropType } from 'vue';
import proj4 from 'proj4';

import { register } from 'ol/proj/proj4';

import Map from 'ol/Map';
import View from 'ol/View';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Geometry from 'ol/geom/Geometry';
import VectorSource from 'ol/source/Vector';
import Feature, { FeatureLike } from 'ol/Feature';
import { Stroke, Style } from 'ol/style';
import MapBrowserEvent from 'ol/MapBrowserEvent';

import Control from 'ol/control/Control';
import Interaction from 'ol/interaction/Interaction';

import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps';

import LayersSettingsControl from 'src/components/ui/controls/LayersSettingsControl.vue';
import FullScreenControl from 'src/components/ui/controls/FullScreenControl.vue';
import ZoomSliderControl from 'src/components/ui/controls/ZoomSliderControl.vue';

const MAX_ZOOM = 20;
const MIN_ZOOM = 10;
const MAP_CONTAINER_ID = 'map';

const props = defineProps({
	zoom: {
		type: Number as PropType<number>,
		default: 10,
	},
	center: {
		type: Array as PropType<number[]>,
		default: () => [0, 0],
	},
	layers: {
		type: Array as PropType<VectorLayer<VectorSource<Geometry>>[]>,
		default: () => [],
	},
	controls: {
		type: Array as PropType<Control[]>,
		default: () => [],
	},
	interactions: {
		type: Array as PropType<Interaction[]>,
		default: () => [],
	},
	hoverable: {
		type: Boolean as PropType<boolean>,
		default: false,
	},
});

const emit = defineEmits({
	click: null,
	pointermove: null,
	'change:resolution': null,
	'change:view': null,
});

const osmLayer = new TileLayer({
	source: new XYZ({
		url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		crossOrigin: 'Anonymous',
	}),
});

const bingLayer = new TileLayer({
	source: new BingMaps({
		cacheSize: 512,
		imagerySet: 'Aerial',
		key: process.env.BING_MAP_KEY,
	}),
	visible: false,
});

let highlightedFeatures: Set<string | number> = new Set();
const overlaySource = new VectorSource();
const featureOverlayLayer = new VectorLayer({
	source: overlaySource,
	style: new Style({
		stroke: new Stroke({
			color: 'rgba(255, 255, 255)',
			width: 2,
		}),
	}),
});

const layersSettingsControlRef = ref();
const fullScreenControlRef = ref();
const zoomSliderControlRef = ref();

const map = ref<Map | null>(null);
const mapElement = ref<HTMLDivElement>();

const resizeObserver = new ResizeObserver(updateSize);

watch(
	() => props.controls,
	(newControls, prevControls) => {
		prevControls.forEach((control) => map.value?.removeControl(control));
		newControls.forEach((control) => map.value?.addControl(control));
	}
);

watch(
	() => props.interactions,
	(newInterations, prevInteractions) => {
		prevInteractions.forEach((interaction) =>
			map.value?.removeInteraction(interaction)
		);
		newInterations.forEach((interaction) =>
			map.value?.addInteraction(interaction)
		);
	}
);

onMounted(() => {
	defineMsk77();

	ininMap();

	if (mapElement.value) {
		resizeObserver.observe(mapElement.value);
	}
});

onBeforeUnmount(() => {
	resizeObserver.disconnect();
});

function updateSize(): void {
	map.value?.updateSize();
}

function defineMsk77(): void {
	proj4.defs(
		'MSK-77',
		'+proj=tmerc +lat_0=55.66666666667 +lon_0=37.5 +k=1 +x_0=11.86143 +y_0=12.1761150 +ellps=bessel +towgs84=316.151,78.924,589.65,-1.57273,2.69209,2.34693,8.4507 +units=m +no_defs'
	);

	register(proj4);
}

function ininMap(): void {
	map.value = new Map({
		target: MAP_CONTAINER_ID,
		controls: [
			new Control({
				element: zoomSliderControlRef.value.$el,
			}),
			new Control({
				element: fullScreenControlRef.value.$el,
			}),
			new Control({
				element: layersSettingsControlRef.value.$el,
			}),
			...props.controls,
		],
		view: new View({
			center: props.center,
			zoom: props.zoom,
			minZoom: MIN_ZOOM,
			maxZoom: MAX_ZOOM,
			projection: 'MSK-77',
		}),
		layers: [bingLayer, osmLayer, ...props.layers, featureOverlayLayer],
	});

	handleAndEmitMapEvents();

	map.value.getView().changed();
}

function handleAndEmitMapEvents(): void {
	if (!map.value) {
		return;
	}

	map.value.on('dblclick', () => {
		const view = map.value?.getView();
		const currentZoom = view?.getZoom();

		if (!currentZoom) {
			return;
		}

		map.value?.getView().setZoom(currentZoom + 1);
	});

	map.value.on('click', (event) => {
		emit('click', event);
	});

	map.value.on('pointermove', (event) => {
		emit('pointermove', event);

		if (!map.value) {
			return;
		}

		if (!props.hoverable) {
			return;
		}

		const hasFeatureAtPixel = map.value.hasFeatureAtPixel(event.pixel);

		map.value.getTargetElement().style.cursor = hasFeatureAtPixel
			? 'pointer'
			: '';

		if (hasFeatureAtPixel) {
			higlightFeatures(event);
		} else {
			overlaySource.clear();
			highlightedFeatures.clear();
		}
	});

	map.value.getView().on('change:resolution', (event) => {
		emit('change:resolution', event);
	});

	map.value.getView().on('change', (event) => {
		emit('change:view', event);
	});
}

function higlightFeatures(event: MapBrowserEvent<UIEvent>): void {
	if (event.dragging) {
		return;
	}

	const newFeatures = map.value?.getFeaturesAtPixel(event.pixel);
	const newFeaturesIds: Set<string | number> = new Set();

	if (!newFeatures) {
		return;
	}

	const newFeaturesById: globalThis.Map<
		string | number | undefined,
		FeatureLike
	> = new window.Map(newFeatures.map((el) => [el.getId(), el]));

	newFeatures.forEach((feature) => {
		const featureId = feature.getId();
		if (!featureId) {
			return;
		}
		newFeaturesIds.add(featureId);
	});

	Array.from(highlightedFeatures).forEach((id) => {
		if (!newFeaturesIds.has(id)) {
			const featureToRemove = overlaySource.getFeatureById(id);
			highlightedFeatures.delete(id);
			if (featureToRemove) {
				overlaySource.removeFeature(featureToRemove);
			}
		}
	});

	Array.from(newFeaturesIds).forEach((id) => {
		if (!highlightedFeatures.has(id)) {
			highlightedFeatures.add(id);
			const featureToAdd = newFeaturesById.get(id);

			if (featureToAdd) {
				overlaySource.addFeature(featureToAdd as Feature<Geometry>);
			}
		}
	});
}

defineExpose({
	map,
});
</script>

<template>
	<zoom-slider-control
		ref="zoomSliderControlRef"
		:max-zoom="MAX_ZOOM"
		:min-zoom="MIN_ZOOM"
		:zoom="props.zoom"
		:map-view="map?.getView()"
	/>
	<full-screen-control
		ref="fullScreenControlRef"
		:map-element="mapElement"
	/>
	<layers-settings-control
		ref="layersSettingsControlRef"
		:osm-layer="osmLayer"
		:bing-layer="bingLayer"
	>
		<template v-slot:layers-control>
			<slot name="layers-control" />
		</template>
	</layers-settings-control>
	<div
		ref="mapElement"
		:id="MAP_CONTAINER_ID"
		class="open-layers-map full-width full-height flex"
	/>
</template>

<style lang="stylus">
.asdfasdf
	position absolute
</style>
