<script setup lang="ts">
import { ref, computed } from 'vue';
import { QTableProps, useQuasar } from 'quasar';

import api, { IUserListGetItemResponse } from 'src/api';
// import { PageName } from 'src/router';

import { useUserStore } from 'src/stores/user';

const $q = useQuasar();
const userStore = useUserStore();

const isUserListLoading = ref(false);
const isSubmitDeleteUserModalOpen = ref(false);
const userIdForDeleting = ref<number | null>(null);

const userList = ref<IUserListGetItemResponse[]>([]);

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
			name: 'secondName',
			label: 'Фамилия',
			field: 'secondName',
			align: 'left',
		},
		{
			name: 'firstName',
			label: 'Имя',
			field: 'firstName',
			align: 'left',
		},
		{
			name: 'patronymic',
			label: 'Отчество',
			field: 'patronymic',
			align: 'left',
		},
		{
			name: 'email',
			label: 'Email',
			field: 'login',
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

function onCreated(): void {
	updateUserList(pagination.value);
}

function formatPaginationLabel(
	firstRowIndex: number,
	endRowIndex: number,
	totalRowsNumber: number
): string {
	return `${firstRowIndex}-${endRowIndex} из ${totalRowsNumber}`;
}

async function updateUserList({
	page,
	rowsPerPage,
}: {
	page: number;
	rowsPerPage: number;
}): Promise<void> {
	try {
		const offset = (page - 1) * rowsPerPage;

		isUserListLoading.value = true;
		const { users, total } = await api.userList.get({
			offset,
			limit: rowsPerPage,
		});
		isUserListLoading.value = false;

		userList.value = users;
		pagination.value.rowsNumber = total;
		pagination.value.page = page;
		pagination.value.rowsPerPage = rowsPerPage;
	} finally {
		isUserListLoading.value = false;
	}
}

function handleDeleteButtonClick(id: number): void {
	userIdForDeleting.value = id;
	isSubmitDeleteUserModalOpen.value = true;
}

async function deleteUser(): Promise<void> {
	if (typeof userIdForDeleting.value !== 'number') {
		return;
	}

	try {
		await api.user.delete({
			id: userIdForDeleting.value,
		});

		isSubmitDeleteUserModalOpen.value = false;
		updateUserList(pagination.value);
	} catch (error) {
		$q.notify({
			message: 'Ведутся работы. Попробуйте позже',
			color: 'info',
			icon: 'report_problem',
		});
	}
}

onCreated();
</script>
<template>
	<q-table
		:grid="$q.screen.xs"
		v-model:pagination="pagination"
		:rows="userList"
		:columns="columns"
		row-key="id"
		rows-per-page-label="Пользователей на странице"
		:rows-per-page-options="rowsPerPageOptions"
		:pagination-label="formatPaginationLabel"
		:loading="isUserListLoading"
		@request="updateUserList($event.pagination)"
	>
		<template v-slot:no-data>
			<div
				class="text-subtitle1 full-width row flex-center text-accent q-my-xl"
			>
				Пользователи пока не созданы
			</div>
		</template>

		<template v-slot:body-cell-action-list="props">
			<q-td :props="props">
				<!-- <q-btn
					round
					color="accent"
					size="sm"
					icon="edit"
					outline
					:to="{ name: PageName.UserEdit, params: { id: props.row.id } }"
				/> -->
				<q-btn
					class="q-ml-md"
					round
					color="accent"
					size="sm"
					icon="delete"
					outline
					@click="handleDeleteButtonClick(props.row.id)"
				/>
			</q-td>
		</template>
		<template v-slot:item="props">
			<q-card class="full-width q-mb-lg">
				<q-card-section class="text-body1">
					<div class="q-mb-sm"><b>Id: </b> {{ props.row.id }}</div>
					<div class="q-mb-sm"><b>Фамилия: </b> {{ props.row.secondName }}</div>
					<div class="q-mb-sm"><b>Имя: </b> {{ props.row.firstName }}</div>
					<div class="q-mb-sm">
						<b>Отчество: </b> {{ props.row.patronymic }}
					</div>
					<div class="q-mb-sm"><b>Email: </b>{{ props.row.login }}</div>
				</q-card-section>
				<q-card-section
					v-if="userStore.isSuperAdmin"
					class="flex"
				>
					<!-- <q-btn
						color="accent"
						size="sm"
						icon="edit"
						outline
						:to="{ name: PageName.UserEdit, params: { id: props.row.id } }"
					>
						редактировать
					</q-btn> -->
					<q-btn
						class="q-ml-auto"
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
				<div class="text-h6">Вы уверены, что хотите удалить пользователя?</div>
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
					@click="deleteUser"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<style lang="stylus" scoped>
.q-dialog .q-card
	padding 10px
</style>
