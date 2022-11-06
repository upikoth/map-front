import userRegistration from './urls/user-registration';
import userSession from './urls/user-session';
import user from './urls/user';
import userList from './urls/user-list';
import oksData from './urls/oks-data';
import zuData from './urls/zu-data';
import sprData from './urls/spr-data';
import orgData from './urls/org-data';
import szzData from './urls/szz-data';
import toknData from './urls/tokn-data';
import zoneCalc from './urls/zone-calc';
import industrialQuarterList from './urls/industrial-quarter-list';
import industrialQuarter from './urls/industrial-quarter';
import customData from './urls/custom-data';
import presentation from './urls/presentation';

export * from './urls/user-registration';
export * from './urls/user-session';
export * from './urls/user';
export * from './urls/user-list';
export * from './urls/oks-data';
export * from './urls/zu-data';
export * from './urls/spr-data';
export * from './urls/org-data';
export * from './urls/szz-data';
export * from './urls/tokn-data';
export * from './urls/zone-calc';
export * from './urls/industrial-quarter-list';
export * from './urls/industrial-quarter';
export * from './urls/custom-data';
export * from './urls/presentation';

export * from './types';

export const isUseMocks = false;

export default {
	userRegistration,
	userSession,
	user,
	userList,
	oksData,
	zuData,
	sprData,
	orgData,
	szzData,
	toknData,
	zoneCalc,
	industrialQuarterList,
	industrialQuarter,
	customData,
	presentation,
};
