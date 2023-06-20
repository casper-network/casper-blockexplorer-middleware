import { Controller, Get, Param } from "@nestjs/common";
import { StoredValue } from "casper-js-sdk";
import { IsString } from "class-validator";
import {
  IsValidPublicKeyOrHash,
  ValidationError,
} from "src/utils/nest-validation";

import { AccountsService } from "./accounts.service";

export class AccountByHashOrPublicKeyParamDto {
  @IsValidPublicKeyOrHash("hashOrPublicKey", {
    message: ValidationError.HashOrPublicKey,
  })
  @IsString()
  public hashOrPublicKey: string;
}

export class AccountBalanceParamDto {
  @IsString()
  public uref: string;
}

@Controller("account")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(":hashOrPublicKey")
  async getAccountByHashOrPublicKey(
    @Param() params: AccountByHashOrPublicKeyParamDto
  ): Promise<StoredValue["Account"]> {
    const { hashOrPublicKey } = params;

    const account = await this.accountsService.getAccount(hashOrPublicKey);

    return account;
  }

  @Get("balance/:uref")
  async getAccountBalance(@Param() params: AccountBalanceParamDto) {
    const { uref } = params;

    const balance = await this.accountsService.getBalance(uref);

    return { balance };
  }
}
