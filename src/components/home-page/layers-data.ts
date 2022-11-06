import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import isEqual from 'lodash.isequal';

import api from 'src/api';

import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { Style, Stroke, Fill, Icon } from 'ol/style';

export const ITEMS_PER_REQUEST = 100;

export function useLayersData() {
	const $q = useQuasar();

	const currentViewGeojson = ref();

	const customDataSource = new VectorSource();
	const isCustomDataLayerVisible = ref(true);
	const customDataLayer = new VectorLayer({
		source: customDataSource,
		visible: isCustomDataLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#F12222',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(241, 34, 34, 0.4)',
			}),
		}),
	});

	watch(
		() => isCustomDataLayerVisible.value,
		() => {
			customDataLayer.setVisible(isCustomDataLayerVisible.value);
		}
	);

	async function loadCustomData(): Promise<void> {
		try {
			const { item } = await api.customData.get({
				name: 'preview',
			});

			customDataSource.addFeatures(
				new GeoJSON().readFeatures(JSON.parse(item.value))
			);
		} catch {
			$q.notify({
				message: 'Информация о полигонах не загрузилась',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const zuSource = new VectorSource();
	const isZuLoading = ref(0);
	const isZuLayerVisible = ref(false);
	const zuLayer = new VectorLayer({
		source: zuSource,
		visible: isZuLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#002A4A',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(0, 110, 195, 0.1)',
			}),
		}),
	});

	watch(
		() => isZuLayerVisible.value,
		() => {
			if (isZuLayerVisible.value) {
				loadZu(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				zuSource.clear();
			}
			zuLayer.setVisible(isZuLayerVisible.value);
		}
	);

	async function loadZu(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isZuLoading.value += 1;
			const { collection, total } = await api.zuData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!zuSource.hasFeature(feature)) {
					zuSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isZuLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadZu(limit, loaded, viewport);
			}
		} catch {
			isZuLoading.value -= 1;
			$q.notify({
				message: 'Некоторые земельные участки не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const oksSource = new VectorSource();
	const isOksLoading = ref(0);
	const isOksLayerVisible = ref(false);
	const oksLayer = new VectorLayer({
		source: oksSource,
		visible: isOksLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#F12222',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(241, 34, 34, 0.1)',
			}),
		}),
	});

	watch(
		() => isOksLayerVisible.value,
		() => {
			if (isOksLayerVisible.value) {
				loadOks(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				oksSource.clear();
			}
			oksLayer.setVisible(isOksLayerVisible.value);
		}
	);

	async function loadOks(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isOksLoading.value += 1;
			const { collection, total } = await api.oksData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!oksSource.hasFeature(feature)) {
					oksSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isOksLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadOks(limit, loaded, viewport);
			}
		} catch {
			isOksLoading.value -= 1;
			$q.notify({
				message: 'Некоторые объекты капитального строительства не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const orgSource = new VectorSource();
	const isOrgLoading = ref(0);
	const isOrgLayerVisible = ref(false);
	const orgLayer = new VectorLayer({
		source: orgSource,
		visible: isOrgLayerVisible.value,
		style: new Style({
			image: new Icon({
				src: '/icons/corporate_fare.svg',
			}),
		}),
	});

	watch(
		() => isOrgLayerVisible.value,
		() => {
			if (isOrgLayerVisible.value) {
				loadOrg(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				orgSource.clear();
			}
			orgLayer.setVisible(isOrgLayerVisible.value);
		}
	);

	async function loadOrg(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isOrgLoading.value += 1;
			const { collection, total } = await api.orgData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!orgSource.hasFeature(feature)) {
					orgSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isOrgLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadOrg(limit, loaded, viewport);
			}
		} catch {
			isOrgLoading.value -= 1;
			$q.notify({
				message: 'Некоторые организации не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const sprSource = new VectorSource();
	const isSprLoading = ref(0);
	const isSprLayerVisible = ref(false);
	const sprLayer = new VectorLayer({
		source: sprSource,
		visible: isSprLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#5D3E03',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(93, 62, 3, 0.1)',
			}),
		}),
	});
	watch(
		() => isSprLayerVisible.value,
		() => {
			if (isSprLayerVisible.value) {
				loadSpr(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				sprSource.clear();
			}
			sprLayer.setVisible(isSprLayerVisible.value);
		}
	);

	async function loadSpr(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isSprLoading.value += 1;
			const { collection, total } = await api.sprData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!sprSource.hasFeature(feature)) {
					sprSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isSprLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadSpr(limit, loaded, viewport);
			}
		} catch {
			isSprLoading.value -= 1;
			$q.notify({
				message: 'Некоторые стартовые площадки реновации не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const szzSource = new VectorSource();
	const isSzzLoading = ref(0);
	const isSzzLayerVisible = ref(false);
	const szzLayer = new VectorLayer({
		source: szzSource,
		visible: isSzzLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#F801A0',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(248, 1, 160, 0.1)',
			}),
		}),
	});

	watch(
		() => isSzzLayerVisible.value,
		() => {
			if (isSzzLayerVisible.value) {
				loadSzz(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				szzSource.clear();
			}
			szzLayer.setVisible(isSzzLayerVisible.value);
		}
	);

	async function loadSzz(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isSzzLoading.value += 1;
			const { collection, total } = await api.szzData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!szzSource.hasFeature(feature)) {
					szzSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isSzzLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadSzz(limit, loaded, viewport);
			}
		} catch {
			isSzzLoading.value -= 1;
			$q.notify({
				message: 'Некоторые санитарно-защитные зоны не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	const toknSource = new VectorSource();
	const isToknLoading = ref(0);
	const isToknLayerVisible = ref(false);
	const toknLayer = new VectorLayer({
		source: toknSource,
		visible: isToknLayerVisible.value,
		style: new Style({
			stroke: new Stroke({
				color: '#0D01F8',
				width: 1,
			}),
			fill: new Fill({
				color: 'rgba(13, 1, 248, 0.1)',
			}),
		}),
	});

	watch(
		() => isToknLayerVisible.value,
		() => {
			if (isToknLayerVisible.value) {
				loadTokn(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
			} else {
				toknSource.clear();
			}
			toknLayer.setVisible(isToknLayerVisible.value);
		}
	);

	async function loadTokn(
		limit: number,
		offset: number,
		viewport: unknown
	): Promise<void> {
		try {
			isToknLoading.value += 1;
			const { collection, total } = await api.toknData.get({
				offset: offset,
				limit: limit,
				viewport,
			});

			new GeoJSON().readFeatures(collection).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!toknSource.hasFeature(feature)) {
					toknSource.addFeature(feature);
				}
			});

			const loaded = offset + limit > total ? total : offset + limit;

			isToknLoading.value -= 1;
			if (total > loaded && isEqual(currentViewGeojson.value, viewport)) {
				loadTokn(limit, loaded, viewport);
			}
		} catch {
			isToknLoading.value -= 1;
			$q.notify({
				message:
					'Некоторые территории объектов культурного наследия не загрузились',
				color: 'negative',
				icon: 'report_problem',
			});
		}
	}

	function updateAllLayersData(): void {
		if (isZuLayerVisible.value) {
			loadZu(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}

		if (isOksLayerVisible.value) {
			loadOks(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}

		if (isOrgLayerVisible.value) {
			loadOrg(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}

		if (isSprLayerVisible.value) {
			loadSpr(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}

		if (isSzzLayerVisible.value) {
			loadSzz(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}

		if (isToknLayerVisible.value) {
			loadTokn(ITEMS_PER_REQUEST, 0, currentViewGeojson.value);
		}
	}

	return {
		currentViewGeojson,
		loadCustomData,
		customDataSource,
		isCustomDataLayerVisible,
		customDataLayer,
		isZuLayerVisible,
		loadZu,
		isZuLoading,
		zuLayer,
		zuSource,
		isOksLayerVisible,
		loadOks,
		isOksLoading,
		oksLayer,
		oksSource,
		isOrgLayerVisible,
		loadOrg,
		isOrgLoading,
		orgLayer,
		orgSource,
		isSprLayerVisible,
		loadSpr,
		isSprLoading,
		sprLayer,
		sprSource,
		isSzzLayerVisible,
		loadSzz,
		isSzzLoading,
		szzLayer,
		szzSource,
		isToknLayerVisible,
		loadTokn,
		isToknLoading,
		toknLayer,
		toknSource,
		updateAllLayersData,
	};
}
