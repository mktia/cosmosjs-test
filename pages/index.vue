<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-form class="my-4">
        <v-text-field v-model="aliceMnemonic" label="Alice's mnemonic" />
        <v-text-field v-model="jackMnemonic" label="Jack's mnemonic" />
        <v-btn
          @click="initialize"
          :disabled="aliceMnemonic === '' || jackMnemonic === ''"
        >show account</v-btn>
        <v-btn
          @click="update"
          :disabled="aliceMnemonic === '' || jackMnemonic === ''"
        >update account information</v-btn>
        <v-btn
          @click="testTrade"
          :disabled="aliceWallet.address === '' || jackWallet.address === ''"
        >test trade</v-btn>
      </v-form>
      <v-card class="my-4" v-if="aliceWallet.address !== ''">
        <v-card-title>Alice's wallet</v-card-title>
        <v-card-text>
          <v-simple-table>
            <tr>
              <td class="pr-1">Address</td>
              <td>{{ aliceWallet.address }}</td>
            </tr>
            <tr v-for="coin in aliceWallet.coins" :key="coin.denom">
              <td class="pr-1">{{ coin.denom }}</td>
              <td class="text-right">{{ coin.amount }}</td>
            </tr>
          </v-simple-table>
        </v-card-text>
      </v-card>
      <v-card class="my-4" v-if="jackWallet.address !== ''">
        <v-card-title>Jack's wallet</v-card-title>
        <v-card-text>
          <v-simple-table>
            <tr>
              <td class="pr-1">Address</td>
              <td>{{ jackWallet.address }}</td>
            </tr>
            <tr v-for="coin in jackWallet.coins" :key="coin.denom">
              <td class="pr-1">{{ coin.denom }}</td>
              <td class="text-right">{{ coin.amount }}</td>
            </tr>
          </v-simple-table>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script lang='ts'>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'

import { GaiaApi } from '@chainapsis/cosmosjs/gaia/api'
import { defaultBech32Config } from '@chainapsis/cosmosjs/core/bech32Config'
// import { LedgerWalletProvider } from "@chainapsis/cosmosjs/core/ledgerWallet";
import { LocalWalletProvider } from '@chainapsis/cosmosjs/core/walletProvider'
import { MsgSend } from '@chainapsis/cosmosjs/x/bank'
import { AccAddress } from '@chainapsis/cosmosjs/common/address'
import { Coin } from '@chainapsis/cosmosjs/common/coin'
import { Int } from '@chainapsis/cosmosjs/common/int'
import bigInteger from 'big-integer'
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44'
import { GaiaRest } from '@chainapsis/cosmosjs/gaia/rest'
import { CustomRest } from '@/middleware/customRest'

export interface UserWallet {
  address: string
  coins: Coin[]
}

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data() {
    return {
      aliceMnemonic: '',
      jackMnemonic: '',
      aliceWallet: {
        address: '',
        coins: new Array<Coin>()
      },
      jackWallet: {
        address: '',
        coins: new Array<Coin>()
      },
      aliceWalletProvider: new LocalWalletProvider('cosmos', 'a'),
      jackWalletProvider: new LocalWalletProvider('cosmos', 'a'),
      aliceApi: new GaiaApi({
        chainId: 'test',
        walletProvider: new LocalWalletProvider('cosmos', 'a'),
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      }),
      jackApi: new GaiaApi({
        chainId: 'test',
        walletProvider: new LocalWalletProvider('cosmos', 'a'),
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      })
    }
  },
  methods: {
    initialize: async function(): Promise<void> {
      // dutch barely uncover tornado whale dolphin globe runway second grape hundred barely kangaroo radar monkey input raw artefact radio south snow nice tomato desert
      // hurry thumb twenty original other explain armed crisp field snake treat energy uncle produce universe enjoy machine wealth bottom globe speed topple toy annual
      const aliceWallet = new LocalWalletProvider('cosmos', this.aliceMnemonic)
      const jackWallet = new LocalWalletProvider('cosmos', this.jackMnemonic)
      this.aliceWalletProvider = aliceWallet
      this.jackWalletProvider = jackWallet

      const aliceApi = new GaiaApi({
        chainId: 'namechain',
        walletProvider: this.aliceWalletProvider,
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      })
      this.aliceApi = aliceApi

      const jackApi = new GaiaApi({
        chainId: 'namechain',
        walletProvider: this.jackWalletProvider,
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      })
      this.jackApi = jackApi

      await this.update()
    },
    update: async function(): Promise<void> {
      const aliceApi = this.aliceApi
      const jackApi = this.jackApi

      // You should sign in before using your wallet
      await aliceApi.enable()
      await jackApi.enable()

      const aliceKey = (await aliceApi.getKeys())[0]
      const aliceAccAddress = new AccAddress(aliceKey.address, 'cosmos')
      const aliceRest = new CustomRest(aliceApi.context)
      const aliceAccount = await aliceRest.getAccount(
        aliceKey.address,
        'cosmos'
      )

      this.aliceWallet = {
        address: aliceAccount.getAddress().toBech32(),
        coins: aliceAccount.getCoins()
      }

      const jackKey = (await jackApi.getKeys())[0]
      const jackAccAddress = new AccAddress(jackKey.address, 'cosmos')
      const jackRest = new CustomRest(jackApi.context)
      const jackAccount = await jackRest.getAccount(jackKey.address, 'cosmos')

      this.jackWallet = {
        address: jackAccount.getAddress().toBech32(),
        coins: jackAccount.getCoins()
      }

      return Promise.resolve()
    },
    testTrade: async function(): Promise<void> {
      const aliceApi = this.aliceApi
      await aliceApi.enable()

      const resultBroadcastTxCommit = await aliceApi.sendMsgs(
        [
          new MsgSend(
            AccAddress.fromBech32(this.aliceWallet.address, 'cosmos'),
            AccAddress.fromBech32(this.jackWallet.address, 'cosmos'),
            [new Coin('nametoken', new Int('100'))]
          )
        ],
        {
          // If account number or sequence is omitted, they are calculated automatically
          gas: bigInteger(80000),
          memo: 'test',
          fee: new Coin('nametoken', new Int('11'))
        },
        'commit'
      )
      console.log(resultBroadcastTxCommit)

      return Promise.resolve()
    }
  }
}
</script>
