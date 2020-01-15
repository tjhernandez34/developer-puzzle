import { FormGroup, ValidationErrors } from '@angular/forms';

export function DateRangeValidator(
  control: FormGroup
): ValidationErrors | null {
  const from = control.get('from');
  const to = control.get('to');
  if (!from || !to) {
    return null;
  }

  if (to.value < from.value) {
    return { fromAfterTo: true };
  }

  return null;
}
