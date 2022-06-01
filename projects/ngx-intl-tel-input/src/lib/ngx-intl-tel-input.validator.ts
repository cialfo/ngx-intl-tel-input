import { AbstractControl, ValidationErrors } from '@angular/forms';
import * as lpn from 'libphonenumber-js';

/*
We use "control: any" instead of "control: FormControl" to silence:
"Property 'nativeElement' does not exist on type 'FormControl'".
This happens because I've expanded control with nativeElement via
'NativeElementInjectorDirective' to get an access to the element.
More about this approach and reasons for this:
https://github.com/angular/angular/issues/18025
https://stackoverflow.com/a/54075119/1617590
*/
export const phoneNumberValidator = (myControl: AbstractControl) => {
  let control = myControl as any;
	if (!control.value) {
		return null;
	}
	// Find <input> inside injected nativeElement and get its "id".
	const el: HTMLElement = control.nativeElement as HTMLElement;
	const inputBox: HTMLInputElement | any = el
		? el.querySelector('input[type="tel"]')
		: undefined;
	if (inputBox) {
		const isRequired = control.errors && control.errors.required === true;
		const error: ValidationErrors = { validatePhoneNumber: { valid: false } };

		inputBox.setCustomValidity('Invalid field.');

		let number: lpn.PhoneNumber | undefined;

		try {
			number = lpn.parsePhoneNumber(
				control.value.number,
				control.value.countryCode
			);
		} catch (e) {
			if (isRequired) {
				return error;
			} else {
				inputBox.setCustomValidity('');
			}
		}

		if (control.value) {
			if (!number) {
				return error;
			} else {
				if (
					!lpn.isValidNumberForRegion(
						number.nationalNumber,
						control.value.countryCode
					)
				) {
					return error;
				} else {
					inputBox.setCustomValidity('');
				}
			}
		}
	}
	return null;
};
