import { Amino, Type, Codec } from '@node-a-team/ts-amino'
const { Field, Concrete, DefineStruct } = Amino
import { Msg } from '@chainapsis/cosmosjs/core/tx'
import { AccAddress } from '@chainapsis/cosmosjs/common/address'
import { Coin } from '@chainapsis/cosmosjs/common/coin'

import { sortJSON } from '@chainapsis/cosmosjs/utils/sortJson'

import { getTypeInfo } from '@node-a-team/ts-amino/dist/util'
import { encodeReflectJSON } from '@node-a-team/ts-amino/dist/json-encode'
import { defaultFieldOptions } from '@node-a-team/ts-amino/dist/options'
import { Symbols } from '@node-a-team/ts-amino/dist/type'
import { Int } from '@chainapsis/cosmosjs/common/int'

@DefineStruct()
export class MsgSetName extends Msg {
  @Field.String(0, {
    jsonName: 'name'
  })
  public name: string

  @Field.String(1, {
    jsonName: 'value'
  })
  public value: string

  @Field.Defined(2, {
    jsonName: 'owner'
  })
  public owner: AccAddress

  constructor(name: string, value: string, owner: AccAddress) {
    super()
    this.name = name
    this.value = value
    this.owner = owner
  }

  public getSigners(): AccAddress[] {
    return [this.owner]
  }

  public validateBasic(): void {}
}

@DefineStruct()
export class MsgBuyName extends Msg {
  @Field.String(0, {
    jsonName: 'name'
  })
  public name: string

  @Field.Slice(
    1,
    { type: Type.Defined },
    {
      jsonName: 'bid'
    }
  )
  public bid: Coin[]

  @Field.Defined(2, {
    jsonName: 'buyer'
  })
  public buyer: AccAddress

  constructor(name: string, bid: Coin[], buyer: AccAddress) {
    super()
    this.name = name
    this.bid = bid
    this.buyer = buyer
  }

  public getSigners(): AccAddress[] {
    return [this.buyer]
  }

  public validateBasic(): void {}
}


@DefineStruct()
export class MsgDeleteName extends Msg {
  @Field.String(0, {
    jsonName: 'name'
  })
  public name: string

  @Field.Defined(1, {
    jsonName: 'owner'
  })
  public owner: AccAddress

  constructor(name: string, owner: AccAddress) {
    super()
    this.name = name
    this.owner = owner
  }

  public getSigners(): AccAddress[] {
    return [this.owner]
  }

  public validateBasic(): void {}
}
