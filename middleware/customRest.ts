import { Rest } from "@chainapsis/cosmosjs/core/rest";
import { Account } from "@chainapsis/cosmosjs/core/account";
import { AccAddress } from "@chainapsis/cosmosjs/common/address";
import { CustomBaseAccount } from '@/middleware/customBaseAccount'

export class CustomRest extends Rest {
  public async getAccount(
    account: string | Uint8Array,
    bech32PrefixAccAddr?: string
  ): Promise<Account> {
    if (typeof account === "string" && !bech32PrefixAccAddr) {
      throw new Error("Empty bech32 prefix");
    }

    const accAddress: AccAddress =
      typeof account === "string"
        ? AccAddress.fromBech32(account, bech32PrefixAccAddr)
        : new AccAddress(account, bech32PrefixAccAddr!);

    const result = await this.instance.get(
      `auth/accounts/${accAddress.toBech32()}`
    );
    console.log('customrest', result.data)
    return CustomBaseAccount.fromJSON(result.data);
  }
}