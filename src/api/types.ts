export interface ICommonSuccessResponse {
	success: 1;
	data?: Record<string, unknown>;
}

export interface ICommonError {
	code: ErrorCode;
}

export interface ICommonErrorResponse {
	success: 0;
	error: ICommonError;
}

export type ICommonResponse = ICommonSuccessResponse | ICommonErrorResponse;

export enum ErrorCode {
	NotAuthorized = 403,
	Unknown = 1,
	NotValidAuthParams = 2,
	NotValidRegisterParams = 3,
	EmailAlreadyExist = 4,
}
