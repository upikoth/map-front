<script setup lang="ts">
import { computed, ref, toRefs, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useVuelidate } from '@vuelidate/core';
import { required, email as emailRule, helpers } from '@vuelidate/validators';

import api, { UserRole, ErrorCode } from 'src/api';
import { userRoleOptions, isError } from 'src/utils';
import { PageName } from 'src/router';

import { useUserStore } from 'src/stores/user';

const $q = useQuasar();

const userStore = useUserStore();

const isUserLoaded = ref(false);
const isSubmitLoading = ref(false);

const userForm = reactive({
	role: UserRole.User,
	email: '',
	firstName: '',
	secondName: '',
	patronymic: '',
});

const rules = {
	email: {
		required: helpers.withMessage('Введите email', required),
		email: helpers.withMessage('Введите корректный email', emailRule),
	},
	firstName: {
		required: helpers.withMessage('Введите имя', required),
	},
	secondName: {
		required: helpers.withMessage('Введите фамилию', required),
	},
};

const v$ = useVuelidate(rules, toRefs(userForm));

const titleClass = computed((): string =>
	$q.screen.gt.xs ? 'text-h4' : 'text-h5'
);

const emailError = computed((): string => {
	if (!v$.value.email.$error) {
		return '';
	}

	const message = v$.value.email.$errors[0].$message;

	return typeof message === 'string' ? message : '';
});

const firstNameError = computed((): string => {
	if (!v$.value.firstName.$error) {
		return '';
	}

	const message = v$.value.firstName.$errors[0].$message;

	return typeof message === 'string' ? message : '';
});

const secondNameError = computed((): string => {
	if (!v$.value.secondName.$error) {
		return '';
	}

	const message = v$.value.secondName.$errors[0].$message;

	return typeof message === 'string' ? message : '';
});

const roleValue = computed(() =>
	userRoleOptions.find((option) => option.value === userForm.role)
);

function onCreated(): void {
	fillUserForm();
}

async function fillUserForm(): Promise<void> {
	await userStore.getUser();
	isUserLoaded.value = true;

	const {
		role,
		email,
		firstName,
		secondName,
		patronymic = '',
	} = userStore.user;

	userForm.email = email;
	userForm.role = role;
	userForm.firstName = firstName;
	userForm.secondName = secondName;
	userForm.patronymic = patronymic;
}

async function onSubmit(): Promise<void> {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	try {
		isSubmitLoading.value = true;
		await api.user.patch({
			...userForm,
			id: userStore.user.id,
			patronymic: userForm.patronymic || undefined,
		});

		fillUserForm();
	} catch (error) {
		if (isError(error) && error.code === ErrorCode.EmailAlreadyExist) {
			$q.notify({
				message: 'Указанная почта уже существует',
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

onCreated();
</script>
<template>
	<div
		v-if="isUserLoaded"
		class="user-page"
	>
		<h1
			class="q-ma-none q-mb-lg"
			:class="titleClass"
		>
			Личные данные
		</h1>

		<q-form
			class="column justify-center"
			@submit="onSubmit"
		>
			<q-input
				v-model="userForm.secondName"
				label="Фамилия"
				square
				:error="v$.secondName.$error"
				:error-message="secondNameError"
				@blur="v$.secondName.$touch()"
			/>
			<q-input
				v-model="userForm.firstName"
				label="Имя"
				square
				:error="v$.firstName.$error"
				:error-message="firstNameError"
				@blur="v$.firstName.$touch()"
			/>
			<q-input
				v-model="userForm.patronymic"
				label="Отчество"
				:error="false"
				square
			/>
			<q-input
				v-model="userForm.email"
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
			<q-select
				v-if="false"
				:model-value="roleValue"
				:options="userRoleOptions"
				label="Роль"
				disable
			/>
			<div class="q-ml-auto">
				<q-btn
					class="q-mt-lg"
					label="Отменить"
					size="md"
					color="accent"
					outline
					:to="{ name: PageName.HomePage }"
					:loading="isSubmitLoading"
				/>
				<q-btn
					class="text-white q-mt-lg q-ml-md"
					label="Сохранить"
					type="submit"
					size="md"
					color="accent"
					:loading="isSubmitLoading"
				/>
			</div>
		</q-form>
	</div>
</template>

<style lang="stylus" scoped>
.user-page
	padding 20px 30px

	body.screen--xs &
		padding 20px

	.q-form
		max-width 400px

		body.screen--xs &
			max-width initial
</style>
