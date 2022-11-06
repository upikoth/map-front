<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailRule, helpers } from '@vuelidate/validators';
import { useQuasar } from 'quasar';

import { PageName } from 'src/router';
import { isError } from 'src/utils';
import { ErrorCode } from 'src/api';

import { useUserSessionStore } from 'src/stores/user-session';
import { useUserStore } from 'src/stores/user';

const userSessionStore = useUserSessionStore();
const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

const isSubmitLoading = ref(false);

const email = ref('user@null.ru');
const password = ref('pass');

const rules = {
	email: {
		required: helpers.withMessage('Введите email', required),
		email: helpers.withMessage('Введите корректный email', emailRule),
	},
	password: {
		required: helpers.withMessage('Введите пароль', required),
	},
};

const v$ = useVuelidate(rules, {
	email,
	password,
});

const emailError = computed((): string => {
	if (!v$.value.email.$error) {
		return '';
	}

	const message = v$.value.email.$errors[0].$message;

	return typeof message === 'string' ? message : '';
});

const passwordError = computed((): string => {
	if (!v$.value.password.$error) {
		return '';
	}

	const message = v$.value.password.$errors[0].$message;

	return typeof message === 'string' ? message : '';
});

watch(
	() => email.value,
	() => {
		v$.value.email.$reset();
	}
);

watch(
	() => password.value,
	() => {
		v$.value.password.$reset();
	}
);

function redirectToSignUpPage(): void {
	router.push({ name: PageName.SignUp });
}

async function onSubmit(): Promise<void> {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	try {
		isSubmitLoading.value = true;
		await userSessionStore.login({
			login: email.value,
			password: password.value,
		});

		await userStore.getUser();

		router.push({ name: PageName.HomePage });
	} catch (error) {
		if (isError(error) && error.code === ErrorCode.NotValidAuthParams) {
			$q.notify({
				message: 'Введены неверные данные',
				color: 'negative',
				icon: 'report_problem',
			});
		} else {
			$q.notify({
				message: 'Ведутся работы. Попробуйте позже',
				color: 'info',
				icon: 'report_problem',
			});
		}
	} finally {
		isSubmitLoading.value = false;
	}
}
</script>

<template>
	<q-page class="window-height window-width row justify-center items-center">
		<q-card class="shadow-24 column">
			<q-card-section class="bg-primary">
				<h5 class="text-white q-my-md">Вход в личный кабинет</h5>
			</q-card-section>

			<q-form
				class="q-pa-lg column justify-center"
				@submit="onSubmit"
			>
				<q-input
					class="q-mt-lg"
					v-model="email"
					label="Email"
					:error="v$.email.$error"
					:error-message="emailError"
					square
					clearable
					@blur="v$.email.$touch()"
				>
					<!-- type="email" -->
					<template v-slot:prepend>
						<q-icon name="email" />
					</template>
				</q-input>
				<q-input
					v-model="password"
					label="Пароль"
					type="password"
					:error="v$.password.$error"
					:error-message="passwordError"
					square
					clearable
					@blur="v$.password.$touch()"
				>
					<template v-slot:prepend>
						<q-icon name="lock" />
					</template>
				</q-input>
				<q-btn
					class="full-width text-white q-mt-md"
					label="Войти"
					type="submit"
					size="lg"
					color="accent"
					:loading="isSubmitLoading"
				/>

				<div class="text-grey-6 q-mt-lg q-mb-none text-center">
					<span
						v-if="false"
						class="cursor-pointer"
						@click="redirectToSignUpPage"
						>Зарегистрироваться</span
					>
				</div>

				<div class="q-mt-lg justify-center flex">
					<q-btn
						v-if="!$q.platform.is.android && !$q.platform.is.ios"
						color="green-5"
						size="md"
						href="/null_app.apk"
						target="_blank"
						download
						no-caps
					>
						<q-icon
							class="q-mr-md"
							name="android"
						/>
						download for Android
					</q-btn>
				</div>
			</q-form>
		</q-card>
	</q-page>
</template>

<style lang="stylus" scoped>
.q-card
	width 350px
	height 500px

	body.screen--xs &
		width 100%
		min-height 100%
		border-radius 0

.q-form
	flex-grow 1
</style>
