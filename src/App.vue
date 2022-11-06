<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserSessionStore } from 'src/stores/user-session';
import { useUserStore } from 'src/stores/user';

import { PageName, authPages } from 'src/router';

const router = useRouter();
const route = useRoute();

const userSessionStore = useUserSessionStore();
const userStore = useUserStore();

const isCheckAuthLoading = ref(true);

async function onCreated(): Promise<void> {
	await checkAuthorization();

	if (userSessionStore.isAuthorized) {
		await userStore.getUser();
	}
}

async function checkAuthorization(): Promise<void> {
	await userSessionStore.checkAuth();

	if (
		!userSessionStore.isAuthorized &&
		((route.name && !authPages.includes(route.name)) || !route.name)
	) {
		await router.push({ name: PageName.SingIn });
	}

	if (
		userSessionStore.isAuthorized &&
		route.name &&
		authPages.includes(route.name)
	) {
		await router.push({ name: PageName.HomePage });
	}

	isCheckAuthLoading.value = false;
}

onCreated();
</script>

<template>
	<div
		v-if="isCheckAuthLoading"
		class="window-height window-width row justify-center items-center"
		style="background: linear-gradient(#8274c5, #5a4a9f)"
	></div>
	<router-view v-else />
</template>
