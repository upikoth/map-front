<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import {
	required,
	email as emailRule,
	helpers,
	sameAs,
	or,
} from '@vuelidate/validators';
import { useQuasar } from 'quasar';

import api from 'src/api';
import { PageName } from 'src/router';
import { isError } from 'src/utils';
import { ErrorCode } from 'src/api';

const router = useRouter();
const $q = useQuasar();

const isSubmitLoading = ref(false);

const email = ref('');
const password = ref('');
const confirmPassword = ref('');

const rules = {
	email: {
		required: helpers.withMessage('Введите email', required),
		email: helpers.withMessage('Введите корректный email', emailRule),
	},
	password: {
		required: helpers.withMessage('Введите пароль', required),
		isEqual: helpers.withMessage(
			'Пароли должны совпадать',
			or(() => !confirmPassword.value, sameAs(confirmPassword))
		),
	},
	confirmPassword: {
		required: helpers.withMessage('Введите пароль', required),
		isEqual: helpers.withMessage(
			'Пароли должны совпадать',
			or(() => !password.value, sameAs(password))
		),
	},
};

const v$ = useVuelidate(rules, {
	email,
	password,
	confirmPassword,
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

const confirmPasswordError = computed((): string => {
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
	() => password.value + confirmPassword.value,
	() => {
		v$.value.password.$reset();
		v$.value.confirmPassword.$reset();
	}
);

function onBlurPasswords(): void {
	v$.value.password.$touch();

	if (confirmPassword.value) {
		v$.value.confirmPassword.$touch();
	}
}

function onBlurConfirmPasswords(): void {
	v$.value.confirmPassword.$touch();

	if (password.value) {
		v$.value.password.$touch();
	}
}

function redirectToSignUpPage(): void {
	router.push({ name: PageName.SingIn });
}

async function onSubmit(): Promise<void> {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	try {
		isSubmitLoading.value = true;
		await api.userRegistration.post({
			email: email.value,
			password: password.value,
		});

		router.push({ name: PageName.SingIn });
	} catch (error) {
		if (isError(error) && error.code === ErrorCode.NotValidRegisterParams) {
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
				<h5 class="text-white q-my-md">Регистрация</h5>
			</q-card-section>

			<q-form
				class="q-pa-lg column justify-center"
				@submit="onSubmit"
			>
				<q-input
					v-model="email"
					label="Email"
					type="email"
					:error="v$.email.$error"
					:error-message="emailError"
					square
					clearable
					@blur="v$.email.$touch()"
				>
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
					@blur="onBlurPasswords"
				>
					<template v-slot:prepend>
						<q-icon name="lock" />
					</template>
				</q-input>
				<q-input
					v-model="confirmPassword"
					label="Подтвердите пароль"
					type="password"
					:error="v$.confirmPassword.$error"
					:error-message="confirmPasswordError"
					square
					clearable
					@blur="onBlurConfirmPasswords"
				>
					<template v-slot:prepend>
						<q-icon name="lock" />
					</template>
				</q-input>
				<q-btn
					class="full-width text-white q-mt-lg"
					label="Зарегистрироваться"
					type="submit"
					size="lg"
					color="accent"
					:loading="isSubmitLoading"
				/>

				<div class="text-grey-6 q-mt-lg q-mb-none text-center">
					<span
						class="cursor-pointer"
						@click="redirectToSignUpPage"
						>Войти в личный кабинет</span
					>
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
