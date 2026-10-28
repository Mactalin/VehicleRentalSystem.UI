import { HttpParams } from '@angular/common/http';

/** Builds query params and skips undefined, null and empty values. */
export function toHttpParams(values: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === '') continue;
    params = params.set(key, String(value));
  }
  return params;
}

export class HttpUtil {
  static toHttpParams = toHttpParams;
}