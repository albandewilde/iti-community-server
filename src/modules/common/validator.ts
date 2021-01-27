import * as transformer from "class-transformer";
import { Transform } from "class-transformer";
import * as validator from "class-validator";
import { Class } from "utility-types";
import { HttpResult } from "./HttpResult";
import { Bad, Ok } from "./Result";

export function TryParseNumber() {
    return Transform(transfomObj => {
        const parsed = +transfomObj.value;

        if (Number.isNaN(parsed)) {
            return transfomObj.value;
        }

        return parsed;
    });
}

export const ValidationMetadata = Symbol("ValidationMetadata");

interface ValidationMetadatadata {
    ignore: {
        [prop: string]: true;
    };
}

export function Ignore() {
    return (target: any, property: string) => {
        const metadata: ValidationMetadatadata = Reflect.getMetadata(ValidationMetadata, target.constructor) || { ignore: {} };
        metadata.ignore[property] = true;
        Reflect.defineMetadata(ValidationMetadata, metadata, target.constructor);
    };
}

export function readValidationMetadata(target: any): ValidationMetadatadata | null {
    return Reflect.getMetadata(ValidationMetadata, target) || null;
}

type DynamicValue<T, V> =
    V extends Array<any> ? T[] :
    T;

function transform<T, V>(ctor: Class<T>, value: V) {
    const meta = readValidationMetadata(ctor);
    const preparedValue: any = {};
    const ignoredProperties: any = {};

    if (meta) {
        for (let prop in value) {
            if (meta.ignore[prop]) {
                ignoredProperties[prop] = value[prop];
            }
            else {

                preparedValue[prop] = value[prop];
            }
        }
    }

    const transformedValue = transformer.plainToClass(ctor, meta ? preparedValue : value) as DynamicValue<T, V>;
    if (meta) {
        for (let prop in ignoredProperties) {
            transformedValue[prop] = ignoredProperties[prop];
        }
    }

    return transformedValue;
}

export async function validateAsync<T extends object, V extends object>(ctor: Class<T>, value: V) {
    const transformed = transform(ctor, value);
    const validationErrors = await validator.validate(transformed);

    if (validationErrors.length > 0) return Bad.validationFailed(validationErrors);
    return Ok(transformed);
}

/**
 * Express middleware that validates the request body against the specified class model.
 * @param bodyType - The class model used to validate the body.
 */
export function validateBody(bodyType: Class<any>) {
    return async (req: any, res: any, next: any) => {
        const validationResult = await validateAsync(bodyType, { ...req.body });

        if (!validationResult.success) {
            res.status(400);

            return res.json(
                HttpResult.fromBad(validationResult)
            );
        }
        else {
            req.body = validationResult.value;
        }

        next();
    };
}

/**
 * Express middleware that validates the request query string against the specified class model.
 * @param queryType - The class model used to validate the query.
 */
export function validateQuery(queryType: Class<any>) {
    return async (req: any, res: any, next: any) => {
        const validationResult = await validateAsync(queryType, { ...req.query });

        if (!validationResult.success) {
            res.status(400);

            return res.json(
                HttpResult.fromBad(validationResult)
            );
        }
        else {
            req.query = validationResult.value;
        }

        next();
    };
}

/**
 * Express middleware that validates the route parameters against the specified class model.
 * @param paramsType - The class model used to validate the route parameters.
 */
export function validateParams(paramsType: Class<any>) {
    return async (req: any, res: any, next: any) => {
        const validationResult = await validateAsync(paramsType, { ...req.params });

        if (!validationResult.success) {
            res.status(400);

            return res.json(
                HttpResult.fromBad(validationResult)
            );
        }
        else {
            req.params = validationResult.value;
        }

        next();
    };
}
