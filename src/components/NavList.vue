<script setup lang="ts">
import { computed } from 'vue';
import { PageName } from 'src/router';

import { useUserStore } from 'src/stores/user';

const userStore = useUserStore();

const navList = computed(() =>
	[
		{
			iconName: 'map',
			pageName: PageName.HomePage,
			pageTitle: 'Карта',
			isVisible: true,
		},
		{
			iconName: 'manage_accounts',
			pageName: PageName.UserList,
			pageTitle: 'Пользователи',
			isVisible: userStore.isAdminOrGreater,
		},
		{
			iconName: 'home',
			pageName: PageName.IndustrialQuarter,
			pageTitle: 'Индустриальные кварталы',
			isVisible: userStore.isAdminOrGreater,
		},
	].filter((navListItem) => navListItem.isVisible)
);
</script>

<template>
	<q-list>
		<q-item
			v-for="navItem in navList"
			:key="navItem.pageName"
			:to="{ name: navItem.pageName }"
			clickable
			manual-focus
			v-ripple
		>
			<q-item-section avatar>
				<q-icon
					color="primary"
					:name="navItem.iconName"
				/>
			</q-item-section>

			<q-item-section> {{ navItem.pageTitle }}</q-item-section>
		</q-item>
	</q-list>
</template>

<style lang="stylus" scoped>
.q-list
	margin-top 12px

.q-item
	&.q-manual-focusable:hover

		::v-deep(.q-focus-helper)
			background currentColor
			opacity 0.15

			&:before
				transition none
				opacity: .1
			&:after
				transition none
				opacity: .4
</style>
