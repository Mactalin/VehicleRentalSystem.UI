export function isHttpUrl(value: string | null | undefined): boolean {
  return !!value && /^https?:\/\//i.test(value.trim());
}

export class UrlUtil {
  static isHttpUrl = isHttpUrl;
}