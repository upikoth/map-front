<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Control from 'ol/control/Control';
import { Modify, Snap } from 'ol/interaction';
import Interaction from 'ol/interaction/Interaction';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Geometry from 'ol/geom/Geometry';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';

import { getZoneCalcButtonColor } from 'src/utils/industrial-quarter';

import OpenLayersMap from 'src/components/ui/OpenLayersMap.vue';

import { useIndustrialQuarterLayersData } from 'src/components/industrial-quarter/industrial-quarter-layers-data';

const route = useRoute();

const {
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
} = useIndustrialQuarterLayersData();

const openLayersMap = ref<typeof OpenLayersMap>();

const selectedZuFeature = ref<Feature<Geometry> | null>(null);
const selectedOksFeature = ref<Feature<Geometry> | null>(null);
const selectedOrgFeatures = ref<Feature<Geometry>[]>([]);
const selectedSprFeature = ref<Feature<Geometry> | null>(null);
const selectedSzzFeature = ref<Feature<Geometry> | null>(null);
const selectedToknFeature = ref<Feature<Geometry> | null>(null);

const loadingStatusControlRef = ref();
const industrialQuarterDetailRef = ref();

const isIndustrialQuarterModalOpen = ref(false);
const isModalOpen = ref(false);

const loadingStatusControl = ref<Control | null>(null);
const zoomControl = ref<Control | null>(null);
const actionButtonsControl = ref<Control | null>(null);
const helpInfoControl = ref<Control | null>(null);
const industrialQuarterDetailControl = ref<Control | null>(null);

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
			industrialQuarterDetailControl.value,
		].filter((el) => el) as Control[]
);

const interactions = computed(
	(): Interaction[] =>
		[drawInteraction.value, drawSnap.value, drawModify.value].filter(
			(el) => el
		) as Interaction[]
);

onMounted(async () => {
	initControls();
	await loadIndustrialQuarterDetail(+route.params?.id);

	openLayersMap.value?.map.getView().fit(zuSource.getExtent());
	const currentZoom = openLayersMap.value?.map.getView()?.getZoom();
	openLayersMap.value?.map.getView().setZoom(currentZoom - 0.1);
});

function initControls(): void {
	loadingStatusControl.value = new Control({
		element: loadingStatusControlRef.value.$el,
	});

	industrialQuarterDetailControl.value = new Control({
		element: industrialQuarterDetailRef.value.$el,
	});
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

function handleMapClick(event: MapBrowserEvent<UIEvent>): void {
	let isModalOpenResult = false;
	selectedZuFeature.value = null;
	selectedOksFeature.value = null;
	selectedOrgFeatures.value = [];
	selectedSprFeature.value = null;
	selectedSzzFeature.value = null;
	selectedToknFeature.value = null;

	const zuFeatures = zuSource.getFeaturesAtCoordinate(event.coordinate);

	if (zuFeatures.length) {
		selectedZuFeature.value = zuFeatures[0];
		isModalOpenResult = true;
	}

	const oksFeatures = oksSource.getFeaturesAtCoordinate(event.coordinate);
	if (oksFeatures.length) {
		selectedOksFeature.value = oksFeatures[0];
		isModalOpenResult = true;
	}

	const orgFeature = orgSource.getClosestFeatureToCoordinate(event.coordinate);

	if (orgFeature) {
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
	if (sprFeatures.length) {
		selectedSprFeature.value = sprFeatures[0];
		isModalOpenResult = true;
	}

	const szzFeatures = szzSource.getFeaturesAtCoordinate(event.coordinate);
	if (szzFeatures.length) {
		selectedSzzFeature.value = szzFeatures[0];
		isModalOpenResult = true;
	}

	const toknFeatures = toknSource.getFeaturesAtCoordinate(event.coordinate);
	if (toknFeatures.length) {
		selectedToknFeature.value = toknFeatures[0];
		isModalOpenResult = true;
	}

	isModalOpen.value = isModalOpenResult;
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
</script>

<template>
	<q-btn
		v-show="isLoading"
		ref="loadingStatusControlRef"
		class="loading-control"
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
	</q-btn>
	<q-btn
		v-show="!isLoading"
		ref="industrialQuarterDetailRef"
		class="info-control"
		round
		:color="getZoneCalcButtonColor(industrialQuarterCommonData?.grade)"
		@click="isIndustrialQuarterModalOpen = true"
	>
		{{ industrialQuarterCommonData?.grade || '' }}
	</q-btn>

	<open-layers-map
		ref="openLayersMap"
		:layers="[zuLayer, oksLayer, orgLayer, sprLayer, szzLayer, toknLayer]"
		:controls="controls"
		:interactions="interactions"
		hoverable
		@click="handleMapClick"
	/>

	<q-dialog v-model="isIndustrialQuarterModalOpen">
		<q-card>
			<q-card-section v-if="!!industrialQuarterCommonData">
				<div class="text-h6">Информация об Индустриальном квартале</div>
				<b>Оценка:</b> {{ industrialQuarterCommonData.grade }}
				<br />
				<b>Включает стартовые площадки реновации:</b>
				{{ industrialQuarterCommonData.isAffectedBySPR ? 'Да' : 'Нет' }}
				<br />
				<b>Включает санитарно-защитные зоны:</b>
				{{ industrialQuarterCommonData.isAffectedBySZZ ? 'Да' : 'Нет' }}
				<br />
				<b>Включает территории объектов культурного наследия:</b>
				{{ industrialQuarterCommonData.isAffectedByTOKN ? 'Да' : 'Нет' }}
				<br />
				<b>Площадь объектов капитального строительства:</b>
				{{ industrialQuarterCommonData.oksArea.toFixed(2) }}
				<br />
				<b>Процент ОКС в аварийном состоянии:</b>
				{{ industrialQuarterCommonData.oksAccidentRate }}
				<br />
				<b>Средний возраст ОКС (лет):</b>
				{{ industrialQuarterCommonData.oksAverageAgeYears }}
				<br />
				<b>Количество ОКС:</b>
				{{ industrialQuarterCommonData.oksCount }}
				<br />
				<b>Количество организаций:</b>
				{{ industrialQuarterCommonData.orgCount }}
				<br />
				<b>Количество работников:</b>
				{{ industrialQuarterCommonData.workerCount }}
				<br />
				<b>Площадь земельных участков:</b>
				{{ industrialQuarterCommonData.zuArea }}
				<br />
				<b>Количество земельных участков:</b>
				{{ industrialQuarterCommonData.zuCount }}
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
</template>

<style scoped lang="stylus">
.zomm-alert-control
	position absolute
	right 10px
	top 160px

.loading-control
	position absolute
	right 10px
	top 70px

.info-control
	position absolute
	right 10px
	top 110px

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
