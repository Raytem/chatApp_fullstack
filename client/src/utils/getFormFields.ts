export function getFormFields<T>(form: HTMLFormElement): T {
  return Object.fromEntries(new FormData(form).entries()) as T;
}