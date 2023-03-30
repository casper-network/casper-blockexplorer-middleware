import { Controller, Get, Param } from "@nestjs/common";
import { StoredValue } from "casper-js-sdk";
import { IsString } from "class-validator";
import { IsValidPublicKeyOrHash } from "src/utils/nest-validation";

import { AccountService } from "./account.service";

export class AccountByHashOrPublicKeyParamDtp {
  @IsValidPublicKeyOrHash("hashOrPublicKey", {
    message: "Not a valid public key or hash.",
  })
  @IsString()
  public hashOrPublicKey: string;
}

export class AccountBalanceParamDtp {
  @IsString()
  public uref: string;
}

@Controller("account")
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

  @Get("balance/:uref")
  async getAccountBalance(@Param() params: AccountBalanceParamDtp) {
    const { uref } = params;

    const balance = await this.accountService.getBalance(uref);

    return { balance };
  }
}
