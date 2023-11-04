export function getErrorCode(err: unknown): string | undefined {
  if (
    typeof err === 'object' &&
    err &&
    'code' in err &&
    (typeof err.code === 'string' || typeof err.code === 'number')
  ) {
    return err.code.toString();
  }
}
