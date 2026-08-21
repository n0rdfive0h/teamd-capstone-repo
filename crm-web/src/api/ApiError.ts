// *********************************************
// Borrowed from lab
// *********************************************

export type ApiErrorKind = 'network' | 'http' | 'abort' | 'parse'

export class ApiError extends Error {
    public readonly kind: ApiErrorKind;
    public readonly status?: number;

    constructor(
        message: string,
        kind: ApiErrorKind,
        status?: number,
    ) {
        super(message);
        this.name = 'ApiError';
        this.kind = kind;
        this.status = status;
    }
}