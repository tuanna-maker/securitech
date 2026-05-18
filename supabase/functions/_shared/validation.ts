/**
 * Lightweight validation helpers (no external deps).
 * For production, consider importing zod from esm.sh.
 */

export type ValidationError = { field: string; message: string };

export class Validator {
  private errors: ValidationError[] = [];
  private data: Record<string, unknown>;

  constructor(data: Record<string, unknown>) {
    this.data = data;
  }

  required(field: string, label?: string): this {
    const val = this.data[field];
    if (val === undefined || val === null || val === "") {
      this.errors.push({
        field,
        message: `${label || field} is required`,
      });
    }
    return this;
  }

  string(field: string, opts?: { min?: number; max?: number }): this {
    const val = this.data[field];
    if (val === undefined || val === null) return this;
    if (typeof val !== "string") {
      this.errors.push({ field, message: `${field} must be a string` });
      return this;
    }
    if (opts?.min && val.length < opts.min) {
      this.errors.push({ field, message: `${field} must be at least ${opts.min} chars` });
    }
    if (opts?.max && val.length > opts.max) {
      this.errors.push({ field, message: `${field} must be at most ${opts.max} chars` });
    }
    return this;
  }

  uuid(field: string): this {
    const val = this.data[field];
    if (val === undefined || val === null) return this;
    if (typeof val !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)) {
      this.errors.push({ field, message: `${field} must be a valid UUID` });
    }
    return this;
  }

  enum(field: string, values: string[]): this {
    const val = this.data[field];
    if (val === undefined || val === null) return this;
    if (!values.includes(val as string)) {
      this.errors.push({ field, message: `${field} must be one of: ${values.join(", ")}` });
    }
    return this;
  }

  number(field: string, opts?: { min?: number; max?: number }): this {
    const val = this.data[field];
    if (val === undefined || val === null) return this;
    if (typeof val !== "number" || isNaN(val)) {
      this.errors.push({ field, message: `${field} must be a number` });
      return this;
    }
    if (opts?.min !== undefined && val < opts.min) {
      this.errors.push({ field, message: `${field} must be >= ${opts.min}` });
    }
    if (opts?.max !== undefined && val > opts.max) {
      this.errors.push({ field, message: `${field} must be <= ${opts.max}` });
    }
    return this;
  }

  date(field: string): this {
    const val = this.data[field];
    if (val === undefined || val === null) return this;
    if (typeof val !== "string" || isNaN(Date.parse(val))) {
      this.errors.push({ field, message: `${field} must be a valid date` });
    }
    return this;
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const e of this.errors) {
      if (!grouped[e.field]) grouped[e.field] = [];
      grouped[e.field].push(e.message);
    }
    return grouped;
  }
}

export function validate(data: Record<string, unknown>) {
  return new Validator(data);
}
