<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

import NavList from 'src/components/NavList.vue';

import { PageName } from 'src/router';

import { useUserSessionStore } from 'src/stores/user-session';
import { useUserStore } from 'src/stores/user';

const $q = useQuasar();

const userSessionStore = useUserSessionStore();
const userStore = useUserStore();
const router = useRouter();

const leftDrawerOpen = ref($q.screen.gt.sm);

watch(
	() => $q.screen.gt.sm,
	() => (leftDrawerOpen.value = $q.screen.gt.sm)
);

async function logout(): Promise<void> {
	try {
		await userSessionStore.logout();

		router.push({ name: PageName.SingIn });
	} catch (error) {
		$q.notify({
			message: 'Попробуйте позже',
			color: 'info',
			icon: 'report_problem',
		});
	}
}
</script>

<template>
	<q-layout
		v-if="userStore.isUserInitialLoaded"
		view="hHh LpR lff"
		class="flex"
	>
		<q-header elevated>
			<q-toolbar>
				<q-btn
					dense
					flat
					round
					icon="menu"
					@click="leftDrawerOpen = !leftDrawerOpen"
				/>
				<q-toolbar-title> Интерактивная карта </q-toolbar-title>
				<q-btn
					flat
					round
					dense
					icon="more_vert"
				>
					<q-menu
						transition-show="jump-down"
						transition-hide="jump-up"
					>
						<q-list>
							<q-item
								clickable
								:to="{ name: PageName.User }"
							>
								<q-item-section>Личные данные</q-item-section>
							</q-item>
							<q-separator />
							<q-item
								clickable
								@click="logout"
							>
								<q-item-section>Выйти</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</q-toolbar>
		</q-header>

		<q-drawer
			v-model="leftDrawerOpen"
			side="left"
			bordered
			:behavior="$q.screen.gt.sm ? 'desktop' : 'mobile'"
		>
			<nav-list />
		</q-drawer>

		<q-page-container class="flex">
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<style lang="stylus" scoped>
.q-page-container
	flex-grow 1
	flex-direction column
	width 0px
</style>
