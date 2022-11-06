<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { PageName } from 'src/router';

import UserForm from 'src/components/user/UserForm.vue';

import { useUserStore } from 'src/stores/user';

const $q = useQuasar();
const router = useRouter();
const userStore = useUserStore();

const titleClass = computed((): string =>
	$q.screen.gt.xs ? 'text-h4' : 'text-h5'
);

if (!userStore.isSuperAdmin) {
	router.push({ name: PageName.HomePage });
}
</script>
<template>
	<div class="user-edit-page">
		<h1
			class="q-ma-none q-mb-lg"
			:class="titleClass"
		>
			Редактирование пользователя
		</h1>

		<user-form editing />
	</div>
</template>

<style lang="stylus" scoped>
.user-edit-page
	padding 20px 30px

	body.screen--xs &
		padding 20px
</style>
