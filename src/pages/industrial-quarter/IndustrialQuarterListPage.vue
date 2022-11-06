<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import { PageName } from 'src/router';

import { useUserStore } from 'src/stores/user';

import IndustrialQuarterList from 'src/components/industrial-quarter/IndustrialQuarterList.vue';

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
	<div class="industrial-quarter-list-page">
		<div class="industrial-quarter-list-page__header q-mb-lg flex">
			<h1
				class="q-ma-none"
				:class="titleClass"
			>
				Индустриальные кварталы
			</h1>

			<q-btn
				class="q-ml-auto"
				label="Создать квартал"
				size="md"
				color="accent"
				:to="{ name: PageName.HomePage }"
			/>
		</div>

		<industrial-quarter-list />
	</div>
</template>

<style lang="stylus" scoped>
.industrial-quarter-list-page
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
