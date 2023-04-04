import { Injectable } from "@nestjs/common";
import { CLPublicKey, StoredValue } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import { jsonRpc } from "src/main";
import { ApiError } from "src/utils/ApiError";
import { isValidPublicKey } from "src/utils/validate";

@Injectable()
export class AccountsService {
  async getAccount(hashOrPublicKey: string): Promise<StoredValue["Account"]> {
    const stateRootHash = await jsonRpc.getStateRootHash();
    const accountHash = isValidPublicKey(hashOrPublicKey)
      ? CLPublicKey.fromHex(hashOrPublicKey).toAccountHashStr()
      : `account-hash-${hashOrPublicKey}`;

    const { Account: account } = await jsonRpc.getBlockState(
      stateRootHash,
      accountHash,
      []
    );

    if (!account)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found.");

    return account;
  }

  async getBalance(uref: string) {
    const stateRootHash = await jsonRpc.getStateRootHash();
    const balance = await jsonRpc.getAccountBalance(stateRootHash, uref);

    if (!balance) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Balance not found.");
    }

    return balance.toString();
  }
}
