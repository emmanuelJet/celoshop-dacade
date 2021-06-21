<p align="center">
  <img src="https://i.ibb.co/tD3MC3f/celoshop.png" alt="CeloShop"/>
</p>

<p align="center">
  <a href="https://emmanueljet.github.io/celoshop-dacade" target="_blank">Preview CeloShop</a>
</p>

<p align="center">
  A dacade <a href="https://dacade.org/communities/celo-development-101" target="_blank">Celo Development 101</a> course dApp.
</p>

<p align="center">
<a href="https://opensource.org/licenses/Apache-2.0"><img alt="apache" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg"></a>
<a href="https://github.com/emmanuelJet/celoshop-dacade/actions/workflows/build_and_deploy.yml"><img alt="Build & Deploy" src="https://github.com/emmanuelJet/celoshop-dacade/actions/workflows/build_and_deploy.yml/badge.svg?branch=main"></a>
<img alt="Website" src="https://img.shields.io/website?down_color=red&down_message=Offiline&label=CeloShop&up_color=green&up_message=Online&url=https%3A%2F%2Femmanueljet.github.io%2Fceloshop-dacade">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/emmanuelJet/celoshop-dacade">
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat">
<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/emmanueljet/celoshop-dacade">
<img alt="GitHub language count" src="https://img.shields.io/github/languages/count/emmanuelJet/celoshop-dacade">
<img alt="GitHub package.json dynamic" src="https://img.shields.io/github/package-json/dacade,%20celo,%20emmanueljet/emmanuelJet/celoshop-dacade">
</p>

## What is CeloShop?

<p align="center">
  <a href="https://emmanueljet.github.io/celoshop-dacade" target="_blank"><img src="https://i.ibb.co/7KrPmFJ/CeloShop.png" alt="CeloShop"></a>
</p>

CeloShop is a mini e-commerce testnet decentralization application(dApp) built on Ethereum Blockchain with Celo Technologies. It makes use of three smart contracts (Seller, Courier, and Buyer SmartContract) to deliver a dApp that is simpler to understand, utilize, and maintain, more resilient and performant, and easier to collaborate on

### Key Features

* **SellerContract** is where the majority of the dApp functionality resides. It has the CeloUSDToken interface that performs transactions based functions on the SellerContract and BuyerContract. It also enables buyers to add products, send products to the Courier service, and maintain added products. Lastly, its allows products buyers send product price to sellers upon successful delivery.

* **CourierContract** is where the Courier service actions happen. It has restrictions meant just for the Courier representative. It accepts items from sellers and allows item buyers to check delivery status and location from the BuyerContract. Its modifier allows just the Courier representative to perform logistics functions such as changing items location and delivering items.

* **BuyerContract** is where all buyer functions reside. It enables buyers to deposit the price of the intended purchase item to the SellerContract and sends the item price to the Seller only when a purchased item has been confirmed and received by the Buyer. It also has functions that allow buyers to check their purchase and logistics status.

### Usage

1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the Google Chrome store.
2. Create a Wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
5. Go to the shop [Homepage](https://emmanueljet.github.io/celoshop-dacade).

## Development Guide

Below is the list of available scripts for developments;

### Install

```bash
npm install
```

*Installs required node packages.*

### Development

```bash
npm run dev
```

*Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.*

### Build and Start

```bash
npm run build
```

*Compiles and minifies for production.*

> The below command requires the [servez](https://www.npmjs.com/package/servez) node package. Install globally with: ```npm install servez -g```

```bash
npm run start
```

*Runs the app in production mode.\
Open [https://localhost:8080](https://localhost:8080) to view it in the browser.*

## LICENSE

```md
Copyright 2021 Emmanuel Joseph(JET)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
