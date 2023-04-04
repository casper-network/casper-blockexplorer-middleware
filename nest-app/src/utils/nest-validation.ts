import { registerDecorator, ValidationOptions } from "class-validator";

import { isValidHash, isValidPublicKey } from "./validate";

export const IsValidPublicKeyOrHash = (
  property: string,
  validationOptions?: ValidationOptions
) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: "isValidPublicKeyOrHash",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return isValidPublicKey(value) || isValidHash(value);
        },
      },
    });
  };
};

export const IsValidHash = (
  property: string,
  validationOptions?: ValidationOptions
) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: "isValidHash",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return /^\d+$/.test(value) || isValidHash(value);
        },
      },
    });
  };
};

export enum ValidationError {
  Hash = "Not a valid hash.",
  HashOrPublicKey = "Not a valid public key or hash.",
}
