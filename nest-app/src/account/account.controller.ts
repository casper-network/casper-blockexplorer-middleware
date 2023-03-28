import { Controller, Get, Param } from "@nestjs/common";
import { StoredValue } from "casper-js-sdk";
import {
  IsString,
  registerDecorator,
  ValidationOptions,
} from "class-validator";
import { IsValidHash } from "src/blocks/blocks.controller";
import { isValidPublicKey } from "src/utils/validate";
import { AccountService } from "./account.service";

// TODO: put these in some form of utils
export const IsValidPublicKey = (
  property: string,
  validationOptions?: ValidationOptions
) => {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPublicKey",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string) {
          return isValidPublicKey(value);
        },
      },
    });
  };
};

export class AccountByHashOrPublicKeyParamDtp {
  @IsValidHash("hashOrPublicKey", { message: "Not a valid hash." })
  @IsValidPublicKey("hashOrPublicKey", { message: "Not a valid public key." })
  @IsString()
  public hashOrPublicKey: string;
}

Controller("account");
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(":hashOrPublicKey")
  async getAccountByHashOrPublicKey(
    @Param() params: AccountByHashOrPublicKeyParamDtp
  ): Promise<StoredValue["Account"]> {
    const { hashOrPublicKey } = params;

    const account = await this.accountService.getAccount(hashOrPublicKey);

    return account;
  }
}
