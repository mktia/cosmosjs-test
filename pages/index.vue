<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <v-form class="my-4">
        <v-text-field v-model="aliceMnemonic" label="Alice's mnemonic" />
        <v-text-field v-model="jackMnemonic" label="Jack's mnemonic" />
        <v-btn
          @click="initialize"
          :disabled="aliceMnemonic === '' || jackMnemonic === ''"
          :loading="initializeLoading"
        >show account</v-btn>
        <v-btn
          @click="update"
          :disabled="aliceMnemonic === '' || jackMnemonic === ''"
          :loading="updateLoading"
        >update account information</v-btn>
        <v-btn
          @click="testTrade"
          :disabled="aliceWallet.address === '' || jackWallet.address === ''"
          :loading="tradeLoading"
        >test trade</v-btn>
        <div class="my-3">
          <h3>For Nameservice</h3>
          <v-btn
            @click="buyName"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
            :loading="buyNameLoading"
          >buy name</v-btn>
          <v-btn
            @click="setName"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
            :loading="setNameLoading"
          >set name</v-btn>
          <v-btn
            @click="deleteName"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
            :loading="deleteNameLoading"
          >delete name</v-btn>
        </div>
        <div class="my-3">
          <h3>Access to data with REST API</h3>
          <v-btn
            @click="resolve"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
          >resolve</v-btn>
          <v-btn
            @click="whois"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
          >whois</v-btn>
          <v-btn
            @click="getNames"
            :disabled="aliceWallet.address === '' || jackWallet.address === ''"
          >names</v-btn>
        </div>
      </v-form>
      <div class="my-3">
        <p v-for="log in logs" :key="log">{{ log }}</p>
      </div>
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

import { CustomApi } from '@/middleware/customApi'
// import { GaiaApi } from '@chainapsis/cosmosjs/gaia/api'
import { defaultBech32Config } from '@chainapsis/cosmosjs/core/bech32Config'
// import { LedgerWalletProvider } from "@chainapsis/cosmosjs/core/ledgerWallet";
import { LocalWalletProvider } from '@chainapsis/cosmosjs/core/walletProvider'
import { MsgSend } from '@chainapsis/cosmosjs/x/bank'
import { AccAddress } from '@chainapsis/cosmosjs/common/address'
import { Coin } from '@chainapsis/cosmosjs/common/coin'
import { Int } from '@chainapsis/cosmosjs/common/int'
import bigInteger from 'big-integer'
import { BIP44 } from '@chainapsis/cosmosjs/core/bip44'
// import { GaiaRest } from '@chainapsis/cosmosjs/gaia/rest'
import { CustomRest } from '@/middleware/customRest'
import {
  MsgSetName,
  MsgBuyName,
  MsgDeleteName
} from '@/middleware/x/nameservice'
import { ResultBroadcastTxCommit } from '@chainapsis/cosmosjs/rpc/tx'

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  data() {
    return {
      initializeLoading: false,
      updateLoading: false,
      tradeLoading: false,
      buyNameLoading: false,
      setNameLoading: false,
      deleteNameLoading: false,
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
      aliceApi: new CustomApi({
        chainId: 'test',
        walletProvider: new LocalWalletProvider('cosmos', 'a'),
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      }),
      jackApi: new CustomApi({
        chainId: 'test',
        walletProvider: new LocalWalletProvider('cosmos', 'a'),
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      }),
      logs: Array<string>()
    }
  },
  methods: {
    initialize: async function(): Promise<void> {
      this.initializeLoading = true

      const aliceWallet = new LocalWalletProvider('cosmos', this.aliceMnemonic)
      const jackWallet = new LocalWalletProvider('cosmos', this.jackMnemonic)
      this.aliceWalletProvider = aliceWallet
      this.jackWalletProvider = jackWallet

      const aliceApi = new CustomApi({
        chainId: 'namechain',
        walletProvider: this.aliceWalletProvider,
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      })
      this.aliceApi = aliceApi

      const jackApi = new CustomApi({
        chainId: 'namechain',
        walletProvider: this.jackWalletProvider,
        rpc: 'http://localhost:26657',
        rest: 'http://localhost:1317'
      })
      this.jackApi = jackApi

      await this.update()

      this.initializeLoading = false
    },
    update: async function(): Promise<void> {
      this.updateLoading = true

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

      this.updateLoading = false

      return Promise.resolve()
    },
    testTrade: async function(): Promise<void> {
      this.tradeLoading = true

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
      this.tradeLoading = false

      return Promise.resolve()
    },
    buyName: async function(): Promise<void> {
      this.buyNameLoading = true

      const jackApi = this.jackApi
      await jackApi.enable()

      const resultBroadcastTxCommit = await jackApi.sendMsgs(
        [
          new MsgBuyName(
            'jack1.id',
            [new Coin('nametoken', new Int('5'))],
            AccAddress.fromBech32(this.jackWallet.address, 'cosmos')
          )
        ],
        {
          gas: bigInteger(80000),
          memo: 'test',
          fee: new Coin('nametoken', new Int('11'))
        },
        'commit'
      )
      console.log(resultBroadcastTxCommit)
      this.buyNameLoading = false

      return Promise.resolve()
    },
    setName: async function(): Promise<void> {
      this.setNameLoading = true

      const jackApi = this.jackApi
      await jackApi.enable()

      const resultBroadcastTxCommit = await jackApi.sendMsgs(
        [
          new MsgSetName(
            'jack1.id',
            '8.8.4.4',
            AccAddress.fromBech32(this.jackWallet.address, 'cosmos')
          )
        ],
        {
          gas: bigInteger(80000),
          memo: 'test',
          fee: new Coin('nametoken', new Int('11'))
        },
        'commit'
      )
      console.log(resultBroadcastTxCommit)
      this.setNameLoading = false

      return Promise.resolve()
    },
    deleteName: async function(): Promise<void> {
      this.deleteNameLoading = true

      const jackApi = this.jackApi
      await jackApi.enable()

      const resultBroadcastTxCommit = await jackApi.sendMsgs(
        [
          new MsgDeleteName(
            'jack1.id',
            AccAddress.fromBech32(this.jackWallet.address, 'cosmos')
          )
        ],
        {
          gas: bigInteger(80000),
          memo: 'test',
          fee: new Coin('nametoken', new Int('11'))
        },
        'commit'
      )
      this.deleteNameLoading = false

      return Promise.resolve()
    },
    resolve: async function(): Promise<void> {
      const aliceApi = this.aliceApi
      const aliceRest = new CustomRest(aliceApi.context)
      const result = await aliceRest.resolveName('jack1.id')
      this.logs.push(result)
      console.log(result)

      return Promise.resolve()
    },
    whois: async function(): Promise<void> {
      const aliceApi = this.aliceApi
      const aliceRest = new CustomRest(aliceApi.context)
      const result = await aliceRest.whois('jack1.id')
      this.logs.push(result)
      console.log(result)

      return Promise.resolve()
    },
    getNames: async function(): Promise<void> {
      const aliceApi = this.aliceApi
      const aliceRest = new CustomRest(aliceApi.context)
      const result = await aliceRest.getNames()
      this.logs.push(result)
      console.log(result)

      return Promise.resolve()
    }
  }
}
</script>
