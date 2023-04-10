import { Controller, Get, Param } from "@nestjs/common";
import { StoredValue } from "casper-js-sdk";
import { IsString } from "class-validator";
import {
  IsValidPublicKeyOrHash,
  ValidationError,
} from "src/utils/nest-validation";

import { AccountsService } from "./accounts.service";

export class AccountByHashOrPublicKeyParamDtp {
  @IsValidPublicKeyOrHash("hashOrPublicKey", {
    message: ValidationError.HashOrPublicKey,
  })
  @IsString()
  public hashOrPublicKey: string;
}

export class AccountBalanceParamDtp {
  @IsString()
  public uref: string;
}

@Controller("account")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get(":hashOrPublicKey")
  async getAccountByHashOrPublicKey(
    @Param() params: AccountByHashOrPublicKeyParamDtp
  ): Promise<StoredValue["Account"]> {
    const { hashOrPublicKey } = params;

    console.log({ hashOrPublicKey });

    const account = await this.accountsService.getAccount(hashOrPublicKey);

    console.log({ account });

    return account;
  }

  @Get("balance/:uref")
  async getAccountBalance(@Param() params: AccountBalanceParamDtp) {
    const { uref } = params;

    console.log({ uref });

    const balance = await this.accountsService.getBalance(uref);

    return { balance };
  }
}
