import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { CLPublicKey, StoredValue } from "casper-js-sdk";
import { StatusCodes } from "http-status-codes";
import { jsonRpc } from "src/blocks/blocks.service";
import { ApiError } from "src/utils/ApiError";
import { isValidPublicKey } from "src/utils/validate";

@Injectable()
export class AccountService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async getAccount(hashOrPublicKey: string): Promise<StoredValue["Account"]> {
    const stateRootHash = await jsonRpc.getStateRootHash();
    const something = isValidPublicKey(hashOrPublicKey)
      ? CLPublicKey.fromHex(hashOrPublicKey).toAccountHashStr()
      : `account-hash-${hashOrPublicKey}`;

    const { Account: account } = await jsonRpc.getBlockState(
      stateRootHash,
      something,
      []
    );

    if (!account)
      throw new ApiError(StatusCodes.NOT_FOUND, "Account not found.");

    return account;
  }
}
