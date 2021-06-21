import Web3 from "web3";
import BigNumber from "bignumber.js";
import { newKitFromWeb3 } from "@celo/contractkit";

import CeloShopCourierAbi from "../contract/abi_artifacts/CeloShopCourier.abi.json";
import CeloShopSellerAbi from "../contract/abi_artifacts/CeloShopSeller.abi.json";
import CeloShopBuyerAbi from "../contract/abi_artifacts/CeloShopBuyer.abi.json";
import CeloUSDTokenAbi from "../contract/abi_artifacts/CeloUSDToken.abi.json";

const ERC20_DECIMALS = 18;
const CSCourierContractAddress = "0x5EFCD2a1Ad2dD46518356A94Dd2393E7c7B607e8";
const CSSellerContractAddress = "0x1E86033d4Ea1Ce9073A684D2759c4605589D4873";
const CSBuyerContractAddress = "0xBA0e2d1B831313AC9D434B9aB2457758B2278B38";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

let kit, courier, seller, buyer;
let products = [], transactions = [], deliveries = [];

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      courier = new kit.web3.eth.Contract(CeloShopCourierAbi, CSCourierContractAddress)
      seller = new kit.web3.eth.Contract(CeloShopSellerAbi, CSSellerContractAddress)
      buyer = new kit.web3.eth.Contract(CeloShopBuyerAbi, CSBuyerContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(CeloUSDTokenAbi, cUSDContractAddress)

  const result = await cUSDContract.methods.approve(CSBuyerContractAddress, _price).send({
    from: kit.defaultAccount
  })

  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const celoBalance = totalBalance.CELO.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)

  document.querySelector("#celo-balance").textContent = celoBalance
  document.querySelector("#cUSD-balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _productsLength = await seller.methods.getProductsLength().call()
  
  const _products = []
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await seller.methods.getProduct(i).call()
      resolve({
        index: p.id,
        sold: p.sold,
        price: new BigNumber(p.price),
        sku: p.sku,
        name: p.name,
        image: p.image,
        description: p.description,
        seller: p.seller
      })
    })
    _products.push(_product)
  }

  products = await Promise.all(_products)
  renderProducts()
}

const getSales = async function() {
  const _salesLength = await seller.methods.getSalesLength().call()
  
  const _transactions = []
  for (let i = 0; i < _salesLength; i++) {
    let _transaction = new Promise(async (resolve, reject) => {
      let s = await seller.methods.getSale(i).call()
      resolve({
        index: s.id,
        amount: new BigNumber(s.amount),
        ref: s.ref,
        status: s.status,
        buyer: s.buyer,
        seller: s.seller
      })
    })
    _transactions.push(_transaction)
  }

  transactions = await Promise.all(_transactions)
  renderSales()
}

const getItems = async function() {
  const _itemsLength = await courier.methods.itemCount().call()
  
  const _deliveries = []
  for (let i = 0; i < _itemsLength; i++) {
    let _delivery = new Promise(async (resolve, reject) => {
      let d = await courier.methods.getItem(i).call()
      resolve({
        index: d.id,
        sku: d.sku,
        status: d.status,
        location: d.location,
        buyer: d.buyer,
        timestamp: new Date(d.timestamp * 1000).toUTCString()
      })
    })
    _deliveries.push(_delivery)
  }

  deliveries = await Promise.all(_deliveries)
  renderItems()
}

function renderProducts() {
  document.getElementById("shopJS").innerHTML = ""
  products.forEach((_product) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_product)
    document.getElementById("shopJS").appendChild(newDiv)
  })
}

function renderSales() {
  document.getElementById("sellerJS").innerHTML = ""
  transactions.forEach((_transaction) => {
    const newTr = document.createElement("tr")
    newTr.innerHTML = saleTemplate(_transaction)
    document.getElementById("sellerJS").appendChild(newTr)
  })
}

function renderItems() {
  document.getElementById("courierJS").innerHTML = ""
  deliveries.forEach((_delivery) => {
    const newTr = document.createElement("tr")
    newTr.innerHTML = itemTemplate(_delivery)
    document.getElementById("courierJS").appendChild(newTr)
  })
}

function productTemplate(_product) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_product.image}" alt="${_product.name}">
      <div class="position-absolute top-0 start-0 bg-warning mt-4 px-2 py-1 rounded-end">
        #${_product.index}, ${_product.sku}
      </div>
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_product.sold} Sold
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
          ${identiconTemplate(_product.seller)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_product.name}</h2>
        <p class="card-text mb-4" style="min-height: 82px">
          ${_product.description}             
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${_product.index}>
            Buy for ${_product.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function saleTemplate(_transaction) {
  return `
    <th scope="row">${_transaction.index}</th>
    <td>${_transaction.ref}</td>
    <td>${_transaction.status}</td>
    <td>${_transaction.amount.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</td>
    <td><a href="https://alfajores-blockscout.celo-testnet.org/address/${_transaction.buyer}/transactions" target="_blank" class="text-dark">${_transaction.buyer}</a></td>
    <td><a href="https://alfajores-blockscout.celo-testnet.org/address/${_transaction.seller}/transactions" target="_blank" class="text-dark">${_transaction.seller}</a></td>
  `
}

function itemTemplate(_delivery) {
  return `
    <th scope="row">${_delivery.index}</th>
    <td>${_delivery.sku}</td>
    <td>${_delivery.status}</td>
    <td>${_delivery.location}</td>
    <td><a href="https://alfajores-blockscout.celo-testnet.org/address/${_delivery.buyer}/transactions" target="_blank" class="text-dark">${_delivery.buyer}</a></td>
    <td>${_delivery.timestamp}</td>
  `
}

function identiconTemplate(_address) {
  const icon = blockies.create({
    seed: _address,
    size: 8,
    scale: 16,
  }).toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions" target="_blank">
      <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  document.querySelector('#currentDate').textContent = new Date().getFullYear()
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  await getSales()
  await getItems()
  notificationOff()
});

document.querySelector("#shopJS").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(products[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${products[index].name}"...`)
    try {
      await buyer.methods.productPurchaseDeposit(index).send({
        from: kit.defaultAccount
      })
      notification(`🎉 You successfully bought "${products[index].name}".`)
      getBalance()
      getProducts()
      getSales()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
})

document.querySelector("#newProductBtn").addEventListener("click", async (e) => {
  const params = [
    new BigNumber(document.getElementById("newProductPrice").value)
    .shiftedBy(ERC20_DECIMALS)
    .toString(),
    document.getElementById("newProductSku").value,
    document.getElementById("newProductName").value,
    document.getElementById("newProductImgUrl").value,
    document.getElementById("newProductDescription").value,
  ]
  notification(`⌛ Adding "${params[2]}" with SKU "${params[1]}"...`)
  try {
    await seller.methods.addProduct(...params).send({
      from: kit.defaultAccount
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`🎉 You successfully added "${params[2]}".`)
  getProducts()
})

// Only Product Seller can perform this action 
document.querySelector("#processProductBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("sellerSaleID").value,
    document.getElementById("sellerProductID").value,
  ]

  notification(`⌛ Processing Product to CeloShop Courier`)
  try {
    await seller.methods.sendProductToCourier(...params).send({
      from: kit.defaultAccount
    }).then(() => {
      notification(`🎉 You successfully sent "${products[params[1]].name}" with Sale ID "${params[0]}" to CeloShop Courier.`)

      getSales()
      getItems()
    }).catch(() => {
      notification(`⚠️ Product Seller Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Product Buyer can perform this action 
document.querySelector("#buyerPurchaseStatusBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("buyerStatusSaleID").value,
  ]

  notification(`⌛ Processing Sales Status`)
  try {
    await buyer.methods.checkPurchaseStatus(...params).call().then((result) => {
      notification(`🎉 Your Product Purchase Status is: "${result}"`)
    }).catch(() => {
      notification(`⚠️ Product Buyer Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Product Buyer can perform this action 
document.querySelector("#buyerReceiveItemBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("buyerReceiveItemSaleID").value,
  ]

  notification(`⌛ Processing payment to Seller`)
  try {

    await buyer.methods.receiveItem(...params).send({
      from: kit.defaultAccount
    }).then(() => {
      notification(`🎉 Product Seller Successfuly receive payment`)
      getSales()
    }).catch(() => {
      notification(`⚠️ Product Buyer Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Product Item Owner can perform this action 
document.querySelector("#buyerCourierStatusBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("buyerCourierStatusItemID").value,
  ]

  notification(`⌛ Processing Courier Item Status`)
  try {
    await buyer.methods.checkCourierStatus(...params).call().then((result) => {
      notification(`🎉 Your Product Courier Status is: "${result}"`)
    }).catch(() => {
      notification(`⚠️ Product Buyer Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Product Item Owner can perform this action 
document.querySelector("#buyerCourierLocationBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("buyerCourierLocationItemID").value,
  ]

  notification(`⌛ Processing Courier Item Location`)
  try {
    await buyer.methods.checkCourierLocation(...params).call().then((result) => {
      notification(`🎉 Your Product Courier Location is: "${result}"`)
    }).catch(() => {
      notification(`⚠️ Product Buyer Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Courier Admin can perform this action 
document.querySelector("#changeLocationBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("courierItemID").value,
    document.getElementById("newItemCity").value,
  ]

  notification(`⌛ Processing changes to Item Delivery Location`)
  try {
    await courier.methods.changeItemLocation(...params).send({
      from: kit.defaultAccount
    }).then(() => {
      notification(`🎉 You successfully changed Delivery Item with ID "${params[0]}" location to "${params[1]}".`)
      getItems()
    }).catch(() => {
      notification(`⚠️ Courier Admin Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

// Only Courier Admin can perform this action 
document.querySelector("#deliverItemBtn").addEventListener("click", async (e) => {
  const params = [
    document.getElementById("courier2ItemID").value,
    document.getElementById("finalItemCity").value,
  ]

  notification(`⌛ Processing changes to Deliver Item`)
  try {
    await courier.methods.deliverItem(...params).send({
      from: kit.defaultAccount
    }).then(() => {
      notification(`🎉 You successfully Deliver Item with ID "${params[0]}" to "${params[1]}".`)
      getItems()
    }).catch(() => {
      notification(`⚠️ Courier Admin Only Function`)
    })
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})