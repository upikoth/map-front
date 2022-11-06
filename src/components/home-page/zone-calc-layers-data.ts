import { ref } from 'vue';
import { useQuasar } from 'quasar';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { Style, Stroke, Fill, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

import api, { IZoneCalcCommonInfo } from 'src/api';

const $q = useQuasar();

export function useZoneCalcLayersData() {
	const isZoneCalcDataLoading = ref(false);
	const zoneCalcCommonData = ref<IZoneCalcCommonInfo | null>(null);

	const zoneCalcZuSource = new VectorSource();
	const zoneCalcZuLayer = new VectorLayer({
		source: zoneCalcZuSource,
		visible: true,
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

	const zoneCalcOksSource = new VectorSource();
	const zoneCalcOksLayer = new VectorLayer({
		source: zoneCalcOksSource,
		visible: true,
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

	const zoneCalcOrgSource = new VectorSource();
	const zoneCalcOrgLayer = new VectorLayer({
		source: zoneCalcOrgSource,
		visible: true,
		style: new Style({
			image: new Icon({
				src: '/icons/corporate_fare.svg',
			}),
		}),
	});

	const zoneCalcSprSource = new VectorSource();
	const zoneCalcSprLayer = new VectorLayer({
		source: zoneCalcSprSource,
		visible: true,
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

	const zoneCalcSzzSource = new VectorSource();
	const zoneCalcSzzLayer = new VectorLayer({
		source: zoneCalcSzzSource,
		visible: true,
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

	const zoneCalcToknSource = new VectorSource();
	const zoneCalcToknLayer = new VectorLayer({
		source: zoneCalcToknSource,
		visible: true,
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

	function getDecisionColor(
		decision: 'include' | 'discuss' | 'exclude'
	): string {
		switch (decision) {
			case 'discuss':
				return 'yellow';
			case 'exclude':
				return 'blue';
			case 'include':
				return 'green';
			default:
				return 'blue';
		}
	}

	async function updateZoneCalc(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		geojsonGeometry: any,
		zuIds?: number[],
		oksIds?: number[]
	): Promise<void> {
		try {
			isZoneCalcDataLoading.value = true;
			const response = await api.zoneCalc.get({
				geometry: geojsonGeometry,
				zuIds,
				oksIds,
			});

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { objects, ...commonData } = response;

			zoneCalcCommonData.value = commonData;

			zoneCalcZuSource.clear();
			new GeoJSON().readFeatures(response.objects.zu).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				feature.setStyle(
					new Style({
						stroke: new Stroke({
							color: getDecisionColor(feature.getProperties().decision),
							width: 2,
						}),
						fill: new Fill({
							color: 'rgba(0, 110, 195, 0.1)',
						}),
					})
				);

				if (!zoneCalcZuSource.hasFeature(feature)) {
					zoneCalcZuSource.addFeature(feature);
				}
			});

			zoneCalcOksSource.clear();
			new GeoJSON().readFeatures(response.objects.oks).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				feature.setStyle(
					new Style({
						stroke: new Stroke({
							color: getDecisionColor(feature.getProperties().decision),
							width: 2,
						}),
						fill: new Fill({
							color: 'rgba(241, 34, 34, 0.1)',
						}),
					})
				);

				if (!zoneCalcOksSource.hasFeature(feature)) {
					zoneCalcOksSource.addFeature(feature);
				}
			});

			zoneCalcOrgSource.clear();
			new GeoJSON().readFeatures(response.objects.org).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!zoneCalcOrgSource.hasFeature(feature)) {
					zoneCalcOrgSource.addFeature(feature);
				}
			});

			zoneCalcSprSource.clear();
			new GeoJSON().readFeatures(response.objects.spr).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!zoneCalcSprSource.hasFeature(feature)) {
					zoneCalcSprSource.addFeature(feature);
				}
			});

			zoneCalcSzzSource.clear();
			new GeoJSON().readFeatures(response.objects.szz).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!zoneCalcSzzSource.hasFeature(feature)) {
					zoneCalcSzzSource.addFeature(feature);
				}
			});

			zoneCalcToknSource.clear();
			new GeoJSON().readFeatures(response.objects.tokn).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!zoneCalcToknSource.hasFeature(feature)) {
					zoneCalcToknSource.addFeature(feature);
				}
			});
		} catch {
			$q.notify({
				message: 'Не удалось обновить информацию об объектах',
				type: 'negative',
				icon: 'report_problem',
			});
		} finally {
			isZoneCalcDataLoading.value = false;
		}
	}

	function clearAllZoneCalc(): void {
		zoneCalcZuSource.clear();
		zoneCalcOksSource.clear();
		zoneCalcOrgSource.clear();
		zoneCalcSprSource.clear();
		zoneCalcSzzSource.clear();
		zoneCalcToknSource.clear();
		zoneCalcCommonData.value = null;
	}

	return {
		zoneCalcZuLayer,
		zoneCalcZuSource,
		zoneCalcOksLayer,
		zoneCalcOksSource,
		zoneCalcOrgLayer,
		zoneCalcOrgSource,
		zoneCalcSprLayer,
		zoneCalcSprSource,
		zoneCalcSzzLayer,
		zoneCalcSzzSource,
		zoneCalcToknLayer,
		zoneCalcToknSource,
		zoneCalcCommonData,
		isZoneCalcDataLoading,
		updateZoneCalc,
		clearAllZoneCalc,
	};
}
