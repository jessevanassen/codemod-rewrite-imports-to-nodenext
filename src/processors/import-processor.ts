/**
 * Rewrites an import.
 *
 * It is also allowed to return a nullish value to indicate that the import
 * shouldn't be rewritten and be left as-is.
 *
 * @param importLocation The original import.
 * @returns The new value of the import, or a nullish value to skip the rewrite.
 */
export type ImportProcessor = (importLocation: string) => string | null | undefined;
