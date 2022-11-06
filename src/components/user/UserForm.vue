<script setup lang="ts">
import { computed, ref, toRefs, reactive, PropType, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useVuelidate } from '@vuelidate/core';
import {
	required,
	email as emailRule,
	helpers,
	sameAs,
	or,
} from '@vuelidate/validators';

import api, { UserRole, ErrorCode } from 'src/api';
import { userRoleOptions, isError } from 'src/utils';
import { PageName } from 'src/router';

const props = defineProps({
	editing: {
		type: Boolean as PropType<boolean>,
		default: false,
	},
});

const $q = useQuasar();

const router = useRouter();
const route = useRoute();

const isUserLoaded = ref(false);
const isSubmitLoading = ref(false);

const userForm = reactive({
	role: UserRole.User,
	email: '',
	firstName: '',
	secondName: '',
	patronymic: '',
	password: '',
	confirmPassword: '',
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
	password: {
		required: helpers.withMessage('Введите пароль', required),
		isEqual: helpers.withMessage(
			'Пароли должны совпадать',
			or(
				() => !userForm.confirmPassword,
				sameAs(toRefs(userForm).confirmPassword)
			)
		),
	},
	confirmPassword: {
		required: helpers.withMessage('Введите пароль', required),
		isEqual: helpers.withMessage(
			'Пароли должны совпадать',
			or(() => !userForm.password, sameAs(toRefs(userForm).password))
		),
	},
};

const v$ = useVuelidate(rules, toRefs(userForm));

const editingUserId = computed(
	(): string | null => (route.params.id as string) || null
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

const roleValue = computed(() =>
	userRoleOptions.find((option) => option.value === userForm.role)
);

watch(
	() => userForm.password + userForm.confirmPassword,
	() => {
		v$.value.password.$reset();
		v$.value.confirmPassword.$reset();
	}
);

function onCreated(): void {
	if (props.editing) {
		fillUserForm();
	}
}

function onBlurPasswords(): void {
	v$.value.password.$touch();

	if (userForm.confirmPassword) {
		v$.value.confirmPassword.$touch();
	}
}

function onBlurConfirmPasswords(): void {
	v$.value.confirmPassword.$touch();

	if (userForm.password) {
		v$.value.password.$touch();
	}
}

async function fillUserForm(): Promise<void> {
	if (!editingUserId.value) {
		return;
	}

	const user = await api.user.get({
		id: editingUserId.value,
	});

	isUserLoaded.value = true;

	const { role, email, firstName, secondName, patronymic = '' } = user;

	userForm.email = email;
	userForm.role = role;
	userForm.firstName = firstName;
	userForm.secondName = secondName;
	userForm.patronymic = patronymic;
}

function onSubmit(): void {
	if (props.editing) {
		onSubmitEditUser();
	} else {
		onSubminCreateUser();
	}
}

async function onSubminCreateUser(): Promise<void> {
	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	try {
		isSubmitLoading.value = true;
		await api.user.put({
			...userForm,
			patronymic: userForm.patronymic || undefined,
		});

		router.push({ name: PageName.UserList });
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

async function onSubmitEditUser(): Promise<void> {
	if (!editingUserId.value) {
		return;
	}

	const isFormValid = await v$.value.$validate();
	if (!isFormValid) {
		return;
	}

	try {
		isSubmitLoading.value = true;
		await api.user.patch({
			...userForm,
			id: editingUserId.value,
			patronymic: userForm.patronymic || undefined,
		});

		router.push({ name: PageName.UserList });
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
		v-if="isUserLoaded || !props.editing"
		class="user-form"
	>
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
			<q-input
				v-model="userForm.password"
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
				v-model="userForm.confirmPassword"
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
			<q-select
				v-if="false"
				:model-value="roleValue"
				:options="userRoleOptions"
				label="Роль"
				@update:model-value="userForm.role = $event.value"
			/>
			<div class="q-ml-auto">
				<q-btn
					class="q-mt-lg"
					label="Отменить"
					size="md"
					color="accent"
					outline
					:to="{ name: PageName.UserList }"
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
.user-form
	.q-form
		max-width 400px

		body.screen--xs &
			max-width initial
</style>
