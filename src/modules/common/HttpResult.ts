import { OkVal, Ok, BadResult } from "./Result";

export type HttpOk<TValue = undefined> = TValue;
export type HttpBad<T extends BadResult> = T;

/**
 * A HttpResult represents the result returned from a REST api.
 */
export class HttpResult {
    private constructor() {}

    /**
     * Converts a "Ok" result to its HTTP representation.
     * @param result The result object.
     */
    static fromOk<TValue = undefined>(result: Ok | OkVal<TValue>): HttpOk<TValue> {
        if (result.hasValue) return result.value;
        else return undefined as any;
    }

    /**
     * Converts a "Bad" result to its HTTP representation.
     * @param result The result object.
     */
    static fromBad<T extends BadResult>(result: T): HttpBad<T> {
        return result;
    }
}
