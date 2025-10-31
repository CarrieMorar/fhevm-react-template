/**
 * Validation utilities for form inputs and data
 */

/**
 * Validate numeric input within range
 */
export function validateNumericRange(
  value: number,
  min: number,
  max: number
): { valid: boolean; error?: string } {
  if (isNaN(value)) {
    return { valid: false, error: 'Value must be a number' };
  }

  if (value < min) {
    return { valid: false, error: `Value must be at least ${min}` };
  }

  if (value > max) {
    return { valid: false, error: `Value must be at most ${max}` };
  }

  return { valid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any): { valid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

/**
 * Validate form data
 */
export function validateForm(
  data: Record<string, any>,
  rules: Record<string, (value: any) => { valid: boolean; error?: string }>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, validator] of Object.entries(rules)) {
    const result = validator(data[field]);
    if (!result.valid && result.error) {
      errors[field] = result.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
