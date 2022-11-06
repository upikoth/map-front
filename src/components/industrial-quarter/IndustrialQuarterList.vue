<script setup lang="ts">
import { ref, computed } from 'vue';
import { QTableProps, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

import api, { IIndustrialQuarterListItem } from 'src/api';

import { useUserStore } from 'src/stores/user';
import { PageName } from 'src/router';

const $q = useQuasar();
const userStore = useUserStore();
const router = useRouter();

const isIndustrialQuarterLostLoading = ref(false);
const isSubmitDeleteUserModalOpen = ref(false);
const industrialQuarterIdForDeleting = ref<number | null>(null);

const reportLoadingIds = ref(new Set());

const industrialQuarterList = ref<IIndustrialQuarterListItem[]>([]);

const rowsPerPageOptions = [10, 30, 50];

const pagination = ref({
	page: 1,
	rowsPerPage: rowsPerPageOptions[0],
	rowsNumber: 0,
});

const columns = computed<QTableProps['columns']>(() => {
	const cols: QTableProps['columns'] = [
		{
			name: 'id',
			label: 'Id',
			field: 'id',
			align: 'left',
		},
		{
			name: 'name',
			label: 'Имя квартала',
			field: 'name',
			align: 'left',
		},
		{
			name: 'author',
			label: 'Автор',
			field: 'author',
			align: 'left',
		},
		{
			name: 'date',
			label: 'Дата создания',
			format: (val: string) => formatDate(val),
			field: 'date',
			align: 'left',
		},
		{
			name: 'zuArea',
			label: 'Площадь',
			format: (val: number) => val.toFixed(2),
			field: 'zuArea',
			align: 'left',
		},
		{
			name: 'workerCount',
			label: 'Кол-во сотрудников',
			field: 'workerCount',
			align: 'left',
		},
		{
			name: 'grade',
			label: 'Оценка',
			field: 'grade',
			align: 'left',
		},
	];

	if (userStore.isSuperAdmin) {
		cols.push({
			name: 'action-list',
			label: 'Действия',
			field: 'action-list',
			style: 'width: 100px',
		});
	}

	return cols;
});

function formatDate(date: string): string {
	const newDate = new Date(date);
	return newDate.toLocaleDateString('ru-RU');
}

function onCreated(): void {
	updateindustrialQuarterList(pagination.value);
}

function formatPaginationLabel(
	firstRowIndex: number,
	endRowIndex: number,
	totalRowsNumber: number
): string {
	return `${firstRowIndex}-${endRowIndex} из ${totalRowsNumber}`;
}

async function updateindustrialQuarterList({
	page,
	rowsPerPage,
}: {
	page: number;
	rowsPerPage: number;
}): Promise<void> {
	try {
		const offset = (page - 1) * rowsPerPage;

		isIndustrialQuarterLostLoading.value = true;
		const { items, total } = await api.industrialQuarterList.get({
			offset,
			limit: rowsPerPage,
		});
		isIndustrialQuarterLostLoading.value = false;

		industrialQuarterList.value = items;
		pagination.value.rowsNumber = total;
		pagination.value.page = page;
		pagination.value.rowsPerPage = rowsPerPage;
	} finally {
		isIndustrialQuarterLostLoading.value = false;
	}
}

function handleDeleteButtonClick(id: number): void {
	industrialQuarterIdForDeleting.value = id;
	isSubmitDeleteUserModalOpen.value = true;
}

async function deleteIndustrialQuarter(): Promise<void> {
	if (typeof industrialQuarterIdForDeleting.value !== 'number') {
		return;
	}

	try {
		await api.industrialQuarter.delete({
			id: industrialQuarterIdForDeleting.value,
		});

		isSubmitDeleteUserModalOpen.value = false;
		updateindustrialQuarterList(pagination.value);

		$q.notify({
			message: 'Индустриальный квартал удален',
			color: 'positive',
			icon: 'check_circle',
		});
	} catch (error) {
		$q.notify({
			message: 'Ведутся работы. Попробуйте позже',
			color: 'info',
			icon: 'report_problem',
		});
	}
}

function handleListingItemClick(
	_: Event,
	row: IIndustrialQuarterListItem
): void {
	router.push({ name: PageName.IndustrialQuarterEdit, params: { id: row.id } });
}

async function downloadReport(id: number): Promise<void> {
	try {
		reportLoadingIds.value.add(id);
		const { blob } = await api.presentation.get({ id });

		const a = document.createElement('a');
		const url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = `Отчет об индустриальном квартале. Id - ${id}.pptx`;
		a.click();
		window.URL.revokeObjectURL(url);
	} catch {
		$q.notify({
			message: 'Ведутся работы. Попробуйте позже',
			color: 'info',
			icon: 'report_problem',
		});
	} finally {
		reportLoadingIds.value.delete(id);
	}
}

onCreated();
</script>
<template>
	<q-table
		:grid="$q.screen.xs"
		v-model:pagination="pagination"
		:rows="industrialQuarterList"
		:columns="columns"
		row-key="id"
		rows-per-page-label="Индустриальных кварталов на странице"
		:rows-per-page-options="rowsPerPageOptions"
		:pagination-label="formatPaginationLabel"
		:loading="isIndustrialQuarterLostLoading"
		@request="updateindustrialQuarterList($event.pagination)"
		@row-click="handleListingItemClick"
	>
		<template v-slot:no-data>
			<div
				class="text-subtitle1 full-width row flex-center text-accent q-my-xl"
			>
				Индустриальные кварталы не сформированы
			</div>
		</template>

		<template v-slot:body-cell-action-list="props">
			<q-td :props="props">
				<q-btn
					class="q-ml-md"
					round
					color="accent"
					size="sm"
					icon="download"
					:loading="reportLoadingIds.has(props.row.id)"
					outline
					@click.stop="downloadReport(props.row.id)"
				/>
				<q-btn
					class="q-ml-md"
					round
					color="accent"
					size="sm"
					icon="delete"
					outline
					@click.stop="handleDeleteButtonClick(props.row.id)"
				/>
			</q-td>
		</template>
		<template v-slot:item="props">
			<q-card
				class="full-width q-mb-lg"
				@click="handleListingItemClick"
			>
				<q-card-section class="text-body1">
					<div class="q-mb-sm"><b>Id: </b> {{ props.row.id }}</div>
					<div class="q-mb-sm"><b>Автор: </b> {{ props.row.author }}</div>
					<div class="q-mb-sm">
						<b>Дата создания: </b>
						{{ formatDate(props.row.date) }}
					</div>
					<div class="q-mb-sm"><b>Площадь: </b> {{ props.row.zuArea }}</div>
					<div class="q-mb-sm">
						<b>Кол-во сотрудников:</b>
						{{ props.row.workerCount }}
					</div>
					<div class="q-mb-sm"><b>Оценка: </b>{{ props.row.grade }}</div>
				</q-card-section>
				<q-card-section
					v-if="userStore.isSuperAdmin"
					class="flex"
				>
					<q-btn
						class="q-ml-auto"
						color="accent"
						size="sm"
						icon="download"
						:loading="reportLoadingIds.has(props.row.id)"
						outline
						@click.stop="downloadReport(props.row.id)"
					>
						скачать
					</q-btn>
					<q-btn
						class="q-ml-md"
						color="accent"
						size="sm"
						icon="delete"
						outline
						@click="handleDeleteButtonClick(props.row.id)"
					>
						удалить
					</q-btn>
				</q-card-section>
			</q-card>
		</template>
	</q-table>
	<q-dialog
		v-model="isSubmitDeleteUserModalOpen"
		persistent
	>
		<q-card>
			<q-card-section class="q-mb-md">
				<div class="text-h6">
					Вы уверены, что хотите удалить индустриальный квартал?
				</div>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					class="q-mr-md"
					flat
					label="Отменить"
					color="accent"
					v-close-popup
				/>
				<q-btn
					label="Удалить"
					color="accent"
					@click="deleteIndustrialQuarter"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<style lang="stylus" scoped>
.q-dialog .q-card
	padding 10px
</style>
