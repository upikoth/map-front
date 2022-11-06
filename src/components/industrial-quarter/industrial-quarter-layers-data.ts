import { ref } from 'vue';
import { useQuasar } from 'quasar';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { Style, Stroke, Fill, Icon } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON';

import api, { IZoneCalcCommonInfo } from 'src/api';

const $q = useQuasar();

function getDecisionColor(decision: 'include' | 'discuss' | 'exclude'): string {
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

export function useIndustrialQuarterLayersData() {
	const industrialQuarterCommonData = ref<IZoneCalcCommonInfo | null>(null);
	const isLoading = ref(0);

	const zuSource = new VectorSource();
	const zuLayer = new VectorLayer({
		source: zuSource,
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

	const oksSource = new VectorSource();
	const oksLayer = new VectorLayer({
		source: oksSource,
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

	const orgSource = new VectorSource();
	const orgLayer = new VectorLayer({
		source: orgSource,
		visible: true,
		style: new Style({
			image: new Icon({
				src: '/icons/corporate_fare.svg',
			}),
		}),
	});

	const sprSource = new VectorSource();
	const sprLayer = new VectorLayer({
		source: sprSource,
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

	const szzSource = new VectorSource();
	const szzLayer = new VectorLayer({
		source: szzSource,
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

	const toknSource = new VectorSource();
	const toknLayer = new VectorLayer({
		source: toknSource,
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

	async function loadIndustrialQuarterDetail(id: number): Promise<void> {
		try {
			isLoading.value += 1;
			const response = await api.industrialQuarter.get({
				id,
			});

			const { objects, ...commonData } = response.item;

			industrialQuarterCommonData.value = commonData;

			new GeoJSON().readFeatures(objects.zu).forEach((feature) => {
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

				if (!zuSource.hasFeature(feature)) {
					zuSource.addFeature(feature);
				}
			});

			new GeoJSON().readFeatures(objects.oks).forEach((feature) => {
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

				if (!oksSource.hasFeature(feature)) {
					oksSource.addFeature(feature);
				}
			});

			new GeoJSON().readFeatures(objects.org).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!orgSource.hasFeature(feature)) {
					orgSource.addFeature(feature);
				}
			});

			new GeoJSON().readFeatures(objects.spr).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!sprSource.hasFeature(feature)) {
					sprSource.addFeature(feature);
				}
			});

			new GeoJSON().readFeatures(objects.szz).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!szzSource.hasFeature(feature)) {
					szzSource.addFeature(feature);
				}
			});

			new GeoJSON().readFeatures(objects.tokn).forEach((feature) => {
				const featureId = feature.getProperties().id;
				feature.setId(featureId);

				if (!toknSource.hasFeature(feature)) {
					toknSource.addFeature(feature);
				}
			});
		} catch (e) {
			console.log('error ', e);
			$q.notify({
				message: 'Не удалось получить информацию об ИК',
				color: 'negative',
				icon: 'report_problem',
			});
		} finally {
			isLoading.value -= 1;
		}
	}

	return {
		isLoading,
		zuLayer,
		zuSource,
		oksLayer,
		oksSource,
		orgLayer,
		orgSource,
		sprLayer,
		sprSource,
		szzLayer,
		szzSource,
		toknLayer,
		toknSource,
		industrialQuarterCommonData,
		loadIndustrialQuarterDetail,
	};
}
