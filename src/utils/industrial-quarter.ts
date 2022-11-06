export const getZoneCalcButtonColor = (grade?: number): string => {
	if (typeof grade === 'undefined') {
		return '';
	}

	if (grade < 20) {
		return 'negative';
	} else if (grade < 50) {
		return 'warning';
	} else {
		return 'positive';
	}
};
