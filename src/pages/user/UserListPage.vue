<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { PageName } from 'src/router';

import { useUserStore } from 'src/stores/user';

import UserList from 'src/components/user/UserList.vue';

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const titleClass = computed((): string =>
	$q.screen.gt.xs ? 'text-h4' : 'text-h5'
);

if (!userStore.isAdminOrGreater) {
	router.push({ name: PageName.HomePage });
}
</script>
<template>
	<div class="user-list-page">
		<div class="user-list-page__header q-mb-lg flex">
			<h1
				class="q-ma-none"
				:class="titleClass"
			>
				Пользователи
			</h1>

			<q-btn
				v-if="userStore.isSuperAdmin"
				class="q-ml-auto"
				label="Создать пользователя"
				size="md"
				color="accent"
				:to="{ name: PageName.UserCreate }"
			/>
		</div>

		<user-list />
	</div>
</template>

<style lang="stylus" scoped>
.user-list-page
	padding 20px 30px

	body.screen--xs &
		padding 20px

	&__header

		body.screen--xs &
			display block

		h1
			body.screen--xs &
				margin-bottom 8px
</style>
