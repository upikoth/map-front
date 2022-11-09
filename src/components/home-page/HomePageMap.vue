<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import isEqual from 'lodash.isequal';
import { useQuasar } from 'quasar';

import View from 'ol/View';
import Control from 'ol/control/Control';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify, Snap } from 'ol/interaction';
import Interaction from 'ol/interaction/Interaction';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Geometry from 'ol/geom/Geometry';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import { Style, Stroke, Fill } from 'ol/style';

import {
	getTopLeft,
	getTopRight,
	getBottomRight,
	getBottomLeft,
} from 'ol/extent';

import OpenLayersMap from 'src/components/ui/OpenLayersMap.vue';

import { useLayersData } from 'src/components/home-page/layers-data';
import { useZoneCalcLayersData } from 'src/components/home-page/zone-calc-layers-data';
import api from 'src/api';

import { getZoneCalcButtonColor } from 'src/utils/industrial-quarter';

const ZOOM_BREAKPOINT = 16;

const $q = useQuasar();

const {
	currentViewGeojson,
	loadCustomData,
	isCustomDataLayerVisible,
	customDataLayer,
	isZuLayerVisible,
	isZuLoading,
	zuLayer,
	zuSource,
	isOksLayerVisible,
	isOksLoading,
	oksLayer,
	oksSource,
	isOrgLayerVisible,
	isOrgLoading,
	orgLayer,
	orgSource,
	isSprLayerVisible,
	isSprLoading,
	sprLayer,
	sprSource,
	isSzzLayerVisible,
	isSzzLoading,
	szzLayer,
	szzSource,
	isToknLayerVisible,
	isToknLoading,
	toknLayer,
	toknSource,
	updateAllLayersData,
} = useLayersData();

const {
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
} = useZoneCalcLayersData();

const openLayersMap = ref<typeof OpenLayersMap>();
const isModalOpen = ref(false);
const isZoneCalcResultModalOpen = ref(false);

const selectedZuFeature = ref<Feature<Geometry> | null>(null);
const selectedOksFeature = ref<Feature<Geometry> | null>(null);
const selectedOrgFeatures = ref<Feature<Geometry>[]>([]);
const selectedSprFeature = ref<Feature<Geometry> | null>(null);
const selectedSzzFeature = ref<Feature<Geometry> | null>(null);
const selectedToknFeature = ref<Feature<Geometry> | null>(null);

const currentStep = ref(0);
const stepInfo = [
	{
		label: 'Выбрать область',
		helpInfo: 'Для создания отчета нажмите кнопку «Выбрать область»',
	},
	{
		label: '',
		helpInfo: 'Выберите область, для которой необходимо создать отчет',
	},
	{
		label: 'Получить данные для области',
		helpInfo: 'Вы можете отредактировать область, потянув за ее края',
	},
	{
		label: 'Сформировать Индустриальный квартал',
		helpInfo:
			'Вы можете удалить объекты из индустриального квартала. Информация о полученном квартале доступна по кнопке справа',
	},
];

const loadingStatusControlRef = ref();
const zoomAlertControlRef = ref();
const actionButtonsControlRef = ref();
const helpInfoControlRef = ref();
const zoneCalcResultControlRef = ref();

const loadingStatusControl = ref<Control | null>(null);
const zoomControl = ref<Control | null>(null);
const actionButtonsControl = ref<Control | null>(null);
const helpInfoControl = ref<Control | null>(null);
const zoneCalcResultControl = ref<Control | null>(null);

const isCreateIndustrialQuarterModalOpen = ref(false);
const industrialQuarterName = ref('');

const isAllPoligonsLayersDisabled = ref(true);
const layersVisibilitySettings = ref({
	isZuLayerVisible: true,
	isOksLayerVisible: false,
	isOrgLayerVisible: false,
	isSprLayerVisible: false,
	isSzzLayerVisible: false,
	isToknLayerVisible: false,
});

const drawSource = new VectorSource();
const drawLayer = new VectorLayer({
	source: drawSource,
	style: new Style({
		stroke: new Stroke({
			color: 'blue',
			width: 3,
		}),
		fill: new Fill({
			color: 'rgba(0, 110, 195, 0.1)',
		}),
	}),
});
const drawInteraction = ref<Interaction | null>(null);
const drawSnap = ref<Snap | null>(null);
const drawModify = ref<Modify | null>(null);

const controls = computed(
	(): Control[] =>
		[
			loadingStatusControl.value,
			zoomControl.value,
			actionButtonsControl.value,
			helpInfoControl.value,
			zoneCalcResultControl.value,
		].filter((el) => el) as Control[]
);

const interactions = computed(
	(): Interaction[] =>
		[drawInteraction.value, drawSnap.value, drawModify.value].filter(
			(el) => el
		) as Interaction[]
);

const canReadObjectInfo = computed((): boolean =>
	[0, 2, 3].includes(currentStep.value)
);

const isDataLoading = computed(() => {
	return (
		!!isZuLoading.value ||
		!!isOksLoading.value ||
		!!isOrgLoading.value ||
		!!isSprLoading.value ||
		!!isSzzLoading.value ||
		!!isToknLoading.value ||
		isZoneCalcDataLoading.value
	);
});

watch(
	() => layersVisibilitySettings.value,
	() => {
		isZuLayerVisible.value = layersVisibilitySettings.value.isZuLayerVisible;
		isOksLayerVisible.value = layersVisibilitySettings.value.isOksLayerVisible;
		isOrgLayerVisible.value = layersVisibilitySettings.value.isOrgLayerVisible;
		isSprLayerVisible.value = layersVisibilitySettings.value.isSprLayerVisible;
		isSzzLayerVisible.value = layersVisibilitySettings.value.isSzzLayerVisible;
		isToknLayerVisible.value =
			layersVisibilitySettings.value.isToknLayerVisible;
	},
	{ deep: true }
);

onMounted(() => {
	initControls();
});

function onCreated(): void {
	loadCustomData();
}

function initControls(): void {
	loadingStatusControl.value = new Control({
		element: loadingStatusControlRef.value.$el,
	});

	zoomControl.value = new Control({
		element: zoomAlertControlRef.value.$el,
	});

	actionButtonsControl.value = new Control({
		element: actionButtonsControlRef.value.$el,
	});

	helpInfoControl.value = new Control({
		element: helpInfoControlRef.value.$el,
	});

	zoneCalcResultControl.value = new Control({
		element: zoneCalcResultControlRef.value.$el,
	});
}

function handleChangeResolution(event: { target: View }): void {
	const newZoomValue = Number(event.target.getZoom()?.toFixed(2));

	if (newZoomValue > ZOOM_BREAKPOINT) {
		isCustomDataLayerVisible.value = false;
		isAllPoligonsLayersDisabled.value = false;
		isZuLayerVisible.value = layersVisibilitySettings.value.isZuLayerVisible;
		isOksLayerVisible.value = layersVisibilitySettings.value.isOksLayerVisible;
		isOrgLayerVisible.value = layersVisibilitySettings.value.isOrgLayerVisible;
		isSprLayerVisible.value = layersVisibilitySettings.value.isSprLayerVisible;
		isSzzLayerVisible.value = layersVisibilitySettings.value.isSzzLayerVisible;
		isToknLayerVisible.value =
			layersVisibilitySettings.value.isToknLayerVisible;
	} else {
		isCustomDataLayerVisible.value = true;
		isAllPoligonsLayersDisabled.value = true;
		isZuLayerVisible.value = false;
		isOksLayerVisible.value = false;
		isOrgLayerVisible.value = false;
		isSprLayerVisible.value = false;
		isSzzLayerVisible.value = false;
		isToknLayerVisible.value = false;
	}
}

function handleChangeView(event: { target: View }): void {
	const zoomValue = Number(event.target.getZoom()?.toFixed(2));
	const extent = event.target.calculateExtent();

	const newViewGeojson = {
		type: 'MultiPolygon',
		coordinates: [
			[
				[
					getTopLeft(extent),
					getTopRight(extent),
					getBottomRight(extent),
					getBottomLeft(extent),
					getTopLeft(extent),
				],
			],
		],
	};

	if (isEqual(currentViewGeojson.value, newViewGeojson)) {
		return;
	}

	currentViewGeojson.value = newViewGeojson;

	if (zoomValue > ZOOM_BREAKPOINT) {
		updateAllLayersData();
	}
}

function startDrawing(): void {
	drawInteraction.value = new Draw({
		source: drawSource,
		type: 'MultiPolygon',
	});

	drawInteraction.value.addEventListener('drawend', () => {
		nextTick().then(() => {
			handleAction();
		});
	});

	drawSnap.value = new Snap({
		source: drawSource,
	});

	drawModify.value = new Modify({ source: drawSource });
}

async function handleAction(): Promise<void> {
	switch (currentStep.value) {
		case 0:
			startDrawing();
			currentStep.value += 1;
			break;
		case 1:
			drawInteraction.value = null;
			currentStep.value += 1;
			break;
		case 2:
			const geometry = drawSource.getFeatures()[0]?.getGeometry();
			if (!geometry) {
				return;
			}

			const geojsonGeometry = new GeoJSON().writeGeometryObject(geometry);

			updateZoneCalc(geojsonGeometry);
			drawInteraction.value = null;
			drawSnap.value = null;
			drawModify.value = null;
			drawSource.clear();
			layersVisibilitySettings.value.isOksLayerVisible = false;
			layersVisibilitySettings.value.isOrgLayerVisible = false;
			layersVisibilitySettings.value.isSprLayerVisible = false;
			layersVisibilitySettings.value.isSzzLayerVisible = false;
			layersVisibilitySettings.value.isToknLayerVisible = false;
			layersVisibilitySettings.value.isZuLayerVisible = false;
			currentStep.value += 1;
			break;
		case 3:
			isCreateIndustrialQuarterModalOpen.value = true;
			break;
		default:
			break;
	}
}

async function createIndustrialQuarter(): Promise<void> {
	if (!zoneCalcCommonData.value) {
		return;
	}

	const {
		workerCount,
		grade,
		zuArea,
		oksArea,
		district,
		oksAccidentRate,
		oksAverageAgeYears,
	} = zoneCalcCommonData.value;
	const oksIds = zoneCalcOksSource.getFeatures().map((el) => {
		return el.getProperties().id;
	});
	const zuIds = zoneCalcZuSource.getFeatures().map((el) => {
		return el.getProperties().id;
	});

	if (!openLayersMap.value) {
		return;
	}

	openLayersMap.value?.map.getView().fit(zoneCalcZuSource.getExtent());
	const currentZoom = openLayersMap.value?.map.getView()?.getZoom();
	openLayersMap.value?.map.getView().setZoom(currentZoom - 0.5);

	await new Promise((res) => {
		setTimeout(() => {
			res(1);
		}, 50);
	});

	const canvas = document.getElementsByTagName('canvas')[0];

	canvas.toBlob(async (blob) => {
		if (!blob) {
			return;
		}

		try {
			await api.industrialQuarter.put({
				workerCount,
				grade,
				zuArea,
				oksArea,
				district,
				oksAccidentRate,
				oksAverageAgeYears,
				name: industrialQuarterName.value,
				image: blob,
				objects: {
					oks: oksIds,
					zu: zuIds,
				},
			});

			$q.notify({
				message: 'Индустриальный квартал создан',
				type: 'positive',
				icon: 'check_circle',
			});

			handleCancelButtonClick();
		} catch {
			$q.notify({
				message: 'Не удалось создать Индустриальный квартал',
				type: 'negative',
				icon: 'report_problem',
			});
		}
	});
}

function handleCancelButtonClick(): void {
	currentStep.value = 0;
	drawInteraction.value = null;
	drawSnap.value = null;
	drawModify.value = null;
	layersVisibilitySettings.value.isZuLayerVisible = true;
	drawSource.clear();
	clearAllZoneCalc();
	industrialQuarterName.value = '';
}

function handleMapClick(event: MapBrowserEvent<UIEvent>): void {
	if (!canReadObjectInfo.value) {
		return;
	}

	let isModalOpenResult = false;
	selectedZuFeature.value = null;
	selectedOksFeature.value = null;
	selectedOrgFeatures.value = [];
	selectedSprFeature.value = null;
	selectedSzzFeature.value = null;
	selectedToknFeature.value = null;

	const zuFeatures = zuSource.getFeaturesAtCoordinate(event.coordinate);
	const zoneCalcZuFeatures = zoneCalcZuSource.getFeaturesAtCoordinate(
		event.coordinate
	);

	if (zoneCalcZuFeatures.length || zuFeatures.length) {
		selectedZuFeature.value = zoneCalcZuFeatures[0] || zuFeatures[0];
		isModalOpenResult = true;
	}

	const oksFeatures = oksSource.getFeaturesAtCoordinate(event.coordinate);
	const zoneCalcOksFeatures = zoneCalcOksSource.getFeaturesAtCoordinate(
		event.coordinate
	);
	if (zoneCalcOksFeatures.length || oksFeatures.length) {
		selectedOksFeature.value = zoneCalcOksFeatures[0] || oksFeatures[0];
		isModalOpenResult = true;
	}

	const orgFeature = orgSource.getClosestFeatureToCoordinate(event.coordinate);
	const zoneCalcOrgFeature = zoneCalcOrgSource.getClosestFeatureToCoordinate(
		event.coordinate
	);

	if (zoneCalcOrgFeature) {
		const line = new LineString([
			event.coordinate,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			zoneCalcOrgFeature.getGeometry()?.flatCoordinates,
		]);

		if (line.getLength() < 20) {
			selectedOrgFeatures.value = zoneCalcOrgSource.getFeaturesAtCoordinate(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				zoneCalcOrgFeature.getGeometry()?.flatCoordinates
			);
			isModalOpenResult = true;
		}
	} else if (orgFeature) {
		const line = new LineString([
			event.coordinate,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			orgFeature.getGeometry()?.flatCoordinates,
		]);

		if (line.getLength() < 20) {
			selectedOrgFeatures.value = orgSource.getFeaturesAtCoordinate(
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				orgFeature.getGeometry()?.flatCoordinates
			);
			isModalOpenResult = true;
		}
	}

	const sprFeatures = sprSource.getFeaturesAtCoordinate(event.coordinate);
	const zoneCalcSprFeatures = zoneCalcSprSource.getFeaturesAtCoordinate(
		event.coordinate
	);
	if (zoneCalcSprFeatures.length || sprFeatures.length) {
		selectedSprFeature.value = zoneCalcSprFeatures[0] || sprFeatures[0];
		isModalOpenResult = true;
	}

	const szzFeatures = szzSource.getFeaturesAtCoordinate(event.coordinate);
	const zoneCalcSzzFeatures = zoneCalcSzzSource.getFeaturesAtCoordinate(
		event.coordinate
	);
	if (zoneCalcSzzFeatures.length || szzFeatures.length) {
		selectedSzzFeature.value = zoneCalcSzzFeatures[0] || szzFeatures[0];
		isModalOpenResult = true;
	}

	const toknFeatures = toknSource.getFeaturesAtCoordinate(event.coordinate);
	const zoneCalcToknFeatures = zoneCalcToknSource.getFeaturesAtCoordinate(
		event.coordinate
	);
	if (zoneCalcToknFeatures.length || toknFeatures.length) {
		selectedToknFeature.value = zoneCalcToknFeatures[0] || toknFeatures[0];
		isModalOpenResult = true;
	}

	isModalOpen.value = isModalOpenResult;
}

function getPropertyTInfo(propertyT: number): string {
	switch (propertyT) {
		case 0:
			return 'Информация о собственности отсутствует';
		case 1:
			return 'Москва';
		case 2:
			return 'РФ';
		case 3:
			return 'Иная';
		case 5:
			return 'Неразграниченная';
		default:
			return '-';
	}
}

function getHasEffectIfon(hasEffect: 0 | 1): string {
	switch (hasEffect) {
		case 0:
			return 'В собственности';
		case 1:
			return 'Арендован';
		default:
			return '-';
	}
}

function getDecision(decision: 'include' | 'discuss' | 'exclude'): string {
	switch (decision) {
		case 'discuss':
			return 'Для обсуждения';
		case 'exclude':
			return 'Исключить';
		case 'include':
			return 'Включить';
		default:
			return '-';
	}
}

function deledeZuFromZoneCalc(): void {
	const zuIds = zoneCalcZuSource
		.getFeatures()
		.map((el) => el.getProperties().id)
		.filter((id) => id !== selectedZuFeature.value?.getProperties().id);

	const oksIds = zoneCalcOksSource
		.getFeatures()
		.map((el) => el.getProperties().id);

	updateZoneCalc(undefined, zuIds, oksIds);
}

function deledeOksFromZoneCalc(): void {
	const zuIds = zoneCalcZuSource
		.getFeatures()
		.map((el) => el.getProperties().id);

	const oksIds = zoneCalcOksSource
		.getFeatures()
		.map((el) => el.getProperties().id)
		.filter((id) => id !== selectedOksFeature.value?.getProperties().id);

	updateZoneCalc(undefined, zuIds, oksIds);
}

onCreated();
</script>

<template>
	<q-btn
		v-show="isDataLoading"
		ref="loadingStatusControlRef"
		class="loading-status-control"
		round
		flat
		unelevated
	>
		<q-circular-progress
			indeterminate
			rounded
			size="42px"
			color="primary"
		>
		</q-circular-progress>

		<q-tooltip
			anchor="center left"
			self="center end"
		>
			<div class="loading-status-control-tooltip">Объекты загружаются</div>
		</q-tooltip>
	</q-btn>
	<q-btn
		v-show="!!zoneCalcCommonData"
		ref="zoneCalcResultControlRef"
		class="zone-calc-result-control"
		round
		:color="getZoneCalcButtonColor(zoneCalcCommonData?.grade)"
		@click="isZoneCalcResultModalOpen = true"
	>
		{{ zoneCalcCommonData?.grade || '' }}
	</q-btn>
	<q-btn
		ref="zoomAlertControlRef"
		v-show="isAllPoligonsLayersDisabled"
		class="zomm-alert-control"
		round
		color="red"
		icon="warning"
	>
		<q-tooltip
			anchor="center left"
			self="center end"
		>
			<div class="zomm-alert-control-tooltip">
				Необходимо приблизить карту <br />
				для отображения объектов
			</div>
		</q-tooltip>
	</q-btn>
	<q-list
		ref="actionButtonsControlRef"
		class="action-buttons-control"
	>
		<q-btn
			v-show="currentStep > 0"
			:style="{ 'background-color': 'white!important' }"
			color="red"
			label="Отменить"
			outline
			@click="handleCancelButtonClick"
		/>
		<q-btn
			v-show="stepInfo[currentStep].label"
			class="q-ml-lg"
			color="primary"
			:label="stepInfo[currentStep].label"
			:disabled="isAllPoligonsLayersDisabled"
			:loading="isZoneCalcDataLoading"
			@click="handleAction"
		>
		</q-btn>
	</q-list>
	<q-banner
		v-show="stepInfo[currentStep].helpInfo"
		ref="helpInfoControlRef"
		class="help-info-control bg-deep-purple-4 text-white"
		inline-actions
		rounded
	>
		{{
			isAllPoligonsLayersDisabled
				? 'Необходимо приблизить карту для работы с объектами'
				: stepInfo[currentStep].helpInfo
		}}
	</q-banner>
	<open-layers-map
		ref="openLayersMap"
		:layers="[
			zuLayer,
			oksLayer,
			orgLayer,
			sprLayer,
			szzLayer,
			toknLayer,
			customDataLayer,
			drawLayer,
			zoneCalcZuLayer,
			zoneCalcOksLayer,
			zoneCalcOrgLayer,
			zoneCalcSprLayer,
			zoneCalcSzzLayer,
			zoneCalcToknLayer,
		]"
		:hoverable="canReadObjectInfo"
		:controls="controls"
		:interactions="interactions"
		@click="handleMapClick"
		@change:resolution="handleChangeResolution"
		@change:view="handleChangeView"
	>
		<template v-slot:layers-control>
			<div>
				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isZuLayerVisible"
							label="Земельные участки"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<div
						class="q-ml-md"
						:style="{
							width: '50px',
							height: '40px',
							border: '1px solid #002A4A',
							'background-color': 'rgba(0, 110, 195, 0.1)',
						}"
					></div>
				</q-item>
				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isOksLayerVisible"
							label="Объекты капитального строительства"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<div
						class="q-ml-md"
						:style="{
							width: '50px',
							height: '40px',
							border: '1px solid #F12222',
							'background-color': 'rgba(241, 34, 34, 0.1)',
						}"
					></div>
				</q-item>
				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isOrgLayerVisible"
							label="Организации"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<q-icon
						name="corporate_fare"
						color="red"
						size="40px"
					></q-icon>
				</q-item>

				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isSprLayerVisible"
							label="Стартовые площадки реновации"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<div
						class="q-ml-md"
						:style="{
							width: '50px',
							height: '40px',
							border: '1px solid #5D3E03',
							'background-color': 'rgba(93, 62, 3, 0.1)',
						}"
					></div>
				</q-item>

				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isSzzLayerVisible"
							label="Санитарно-защитные зоны"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<div
						class="q-ml-md"
						:style="{
							width: '50px',
							height: '40px',
							border: '1px solid #F801A0',
							'background-color': 'rgba(248, 1, 160, 0.1)',
						}"
					></div>
				</q-item>

				<q-item>
					<q-item-section>
						<q-checkbox
							v-model="layersVisibilitySettings.isToknLayerVisible"
							label="Территории объектов культурного наследия"
							:disable="isAllPoligonsLayersDisabled"
						/>
					</q-item-section>
					<div
						class="q-ml-md"
						:style="{
							width: '50px',
							height: '40px',
							border: '1px solid #0D01F8',
							'background-color': 'rgba(13, 1, 248, 0.1)',
						}"
					></div>
				</q-item>

				<q-tooltip v-if="isAllPoligonsLayersDisabled">
					<div class="home-page-map-disabled-layers-tooltip">
						Необходимо приблизить карту <br />
						для отображения объектов
					</div>
				</q-tooltip>
			</div>
		</template>
	</open-layers-map>

	<q-dialog v-model="isZoneCalcResultModalOpen">
		<q-card>
			<q-card-section v-if="!!zoneCalcCommonData">
				<div class="text-h6">Информация об Индустриальном квартале</div>
				<b>Оценка:</b> {{ zoneCalcCommonData.grade }}
				<br />
				<b>Включает стартовые площадки реновации:</b>
				{{ zoneCalcCommonData.isAffectedBySPR ? 'Да' : 'Нет' }}
				<br />
				<b>Включает санитарно-защитные зоны:</b>
				{{ zoneCalcCommonData.isAffectedBySZZ ? 'Да' : 'Нет' }}
				<br />
				<b>Включает территории объектов культурного наследия:</b>
				{{ zoneCalcCommonData.isAffectedByTOKN ? 'Да' : 'Нет' }}
				<br />
				<b>Площадь объектов капитального строительства:</b>
				{{
					zoneCalcCommonData.oksArea
						? zoneCalcCommonData.oksArea.toFixed(2)
						: '-'
				}}
				<br />
				<b>Процент ОКС в аварийном состоянии:</b>
				{{
					zoneCalcCommonData.oksAccidentRate
						? zoneCalcCommonData.oksAccidentRate.toFixed(2)
						: '-'
				}}
				<br />
				<b>Средний возраст ОКС (лет):</b>
				{{
					zoneCalcCommonData.oksAverageAgeYears
						? zoneCalcCommonData.oksAverageAgeYears.toFixed(0)
						: '-'
				}}
				<br />
				<b>Количество ОКС:</b>
				{{ zoneCalcCommonData.oksCount }}
				<br />
				<b>Количество организаций:</b>
				{{ zoneCalcCommonData.orgCount }}
				<br />
				<b>Количество работников:</b>
				{{ zoneCalcCommonData.workerCount }}
				<br />
				<b>Площадь земельных участков:</b>
				{{
					zoneCalcCommonData.zuArea ? zoneCalcCommonData.zuArea.toFixed(2) : '-'
				}}
				<br />
				<b>Количество земельных участков:</b>
				{{ zoneCalcCommonData.zuCount }}
			</q-card-section>
			<q-card-actions :align="'right'">
				<q-btn
					class="q-mr-sm q-mb-sm"
					color="accent"
					label="OK"
					v-close-popup
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
	<q-dialog v-model="isModalOpen">
		<q-card>
			<q-card-section v-if="selectedZuFeature">
				<div class="text-h6">Земельный участок</div>
				<template
					v-if="Number.isInteger(selectedZuFeature.getProperties().grade)"
				>
					<b>Оценка:</b> {{ selectedZuFeature.getProperties().grade }}
					<br />
				</template>
				<template v-if="selectedZuFeature.getProperties().decision">
					<b>Решение:</b>
					{{ getDecision(selectedZuFeature.getProperties().decision) }}
					<br />
				</template>
				<b>Адрес:</b> {{ selectedZuFeature.getProperties().address }}
				<br />
				<b>Кадастровый номер:</b> {{ selectedZuFeature.getProperties().cadnum }}
				<br />
				<b>Признак аренды:</b>
				{{ getHasEffectIfon(selectedZuFeature.getProperties().has_effect) }}
				<br />
				<b>Признак собственности:</b>
				{{ getPropertyTInfo(selectedZuFeature.getProperties().property_t) }}
				<br />
				<b>Площадь:</b> {{ selectedZuFeature.getProperties().shape_area }}
				<br />

				<q-btn
					v-if="!!zoneCalcCommonData"
					class="q-mr-sm q-mt-sm"
					color="accent"
					label="Удалить объект"
					v-close-popup
					@click="deledeZuFromZoneCalc"
				/>
			</q-card-section>
			<q-card-section v-if="selectedOksFeature">
				<div class="text-h6">Объект капитального строительства</div>
				<template
					v-if="Number.isInteger(selectedOksFeature.getProperties().grade)"
				>
					<b>Оценка:</b> {{ selectedOksFeature.getProperties().grade }}
					<br />
				</template>
				<template v-if="selectedOksFeature.getProperties().decision">
					<b>Решение:</b>
					{{ getDecision(selectedOksFeature.getProperties().decision) }}
					<br />
				</template>
				<b>Адрес:</b> {{ selectedOksFeature.getProperties().address }}
				<br />
				<b>Площадь:</b> {{ selectedOksFeature.getProperties().area }}
				<br />
				<b>Год постройки:</b>
				{{ selectedOksFeature.getProperties().building_year }}
				<br />
				<b>Кадастровый номер:</b>
				{{ selectedOksFeature.getProperties().cadnum }}
				<br />
				<b>Аварийность:</b>
				{{ selectedOksFeature.getProperties().is_accident_rate }}
				<br />
				<b>Типовой проект:</b>
				{{ selectedOksFeature.getProperties().is_standard_project }}
				<br />
				<b>Жилое/нежилое:</b>
				{{ selectedOksFeature.getProperties().type_living }}
				<br />
				<b>Материал стен:</b>
				{{ selectedOksFeature.getProperties().wall_materials }}
				<br />

				<q-btn
					v-if="!!zoneCalcCommonData && !selectedZuFeature"
					class="q-mr-sm q-mt-sm"
					color="accent"
					label="Удалить объект"
					v-close-popup
					@click="deledeOksFromZoneCalc"
				/>
			</q-card-section>
			<q-card-section v-if="selectedOrgFeatures.length">
				<div class="text-h6">Организации:</div>
				<div
					v-for="(selectedOrgFeature, i) in selectedOrgFeatures"
					:key="i"
					:style="{ 'margin-bottom': '12px' }"
				>
					<b>Название организации:</b>
					{{ selectedOrgFeature.getProperties().name }}
					<br />
					<b>Количество рабочих мест:</b>
					{{ selectedOrgFeature.getProperties().kol_mest }}
				</div>
			</q-card-section>
			<q-card-section v-if="selectedSprFeature">
				<div class="text-h6">Стартовая площадка реновации</div>
				<b>Адрес:</b> {{ selectedSprFeature.getProperties().address }}
				<br />
				<b>Район:</b> {{ selectedSprFeature.getProperties().rayon }}
			</q-card-section>
			<q-card-section v-if="selectedSzzFeature">
				<div class="text-h6">Санитарно-защитная зона</div>
			</q-card-section>
			<q-card-section v-if="selectedToknFeature">
				<div class="text-h6">Территории объектов культурного наследия</div>
				<b>Название территории:</b>
				{{ selectedToknFeature.getProperties().name }}
			</q-card-section>
			<q-card-actions :align="'right'">
				<q-btn
					class="q-mr-sm q-mb-sm"
					color="accent"
					label="OK"
					v-close-popup
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
	<q-dialog v-model="isCreateIndustrialQuarterModalOpen">
		<q-card :style="{ width: '360px' }">
			<q-card-section class="q-mb-md">
				<q-input
					v-model="industrialQuarterName"
					label="Название индустриального квартала"
					square
				/>
			</q-card-section>
			<q-card-actions :align="'right'">
				<q-btn
					class="q-mr-sm q-mb-sm"
					color="accent"
					label="Отмена"
					outline
					v-close-popup
				/>
				<q-btn
					class="q-mr-sm q-mb-sm"
					color="accent"
					label="Создать"
					v-close-popup
					@click="createIndustrialQuarter"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<style scoped lang="stylus">
.zone-calc-result-control
	position absolute
	right 10px
	top 130px

.zomm-alert-control
	position absolute
	right 10px
	top 70px

.loading-status-control
	position absolute
	right 10px
	top 70px

.action-buttons-control
	position absolute
	right 10px
	bottom 10px

.help-info-control
	position absolute
	top 10px
	left 70px
	right 70px

::v-global(.loading-status-control-tooltip)
::v-global(.home-page-map-disabled-layers-tooltip)
::v-global(.zomm-alert-control-tooltip)
	font-size 16px
</style>
