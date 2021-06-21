// SPDX-License-Identifier: Apache-2.0

pragma solidity >= 0.7.0 < 0.9.0;

import './CeloShopSeller.sol';
import './CeloShopCourier.sol';

contract CeloShopBuyer {

  address payable sellerAddress;
  SellerInterface SellerContract;
  CourierInterface CourierContract;
  address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

  event productPurchaseDepositEvent(
    uint productID,
    address buyer
  );

  constructor(
    address payable _sellerAddress,
    address courierAddress
  ) {
    sellerAddress = _sellerAddress;
    SellerContract = SellerInterface(_sellerAddress);
    CourierContract = CourierInterface(courierAddress);
  }

  function productPurchaseDeposit(
    uint productID
  ) public payable {
    uint price = SellerContract.getProductPrice(productID);

    require(
      CeloUSDToken(cUsdTokenAddress).transferFrom(
        msg.sender,
        sellerAddress,
        price
      ),
      "Product Purchase Deposit Transfer Failed."
    );

    SellerContract.addSale(productID);

    emit productPurchaseDepositEvent(
      productID,
      msg.sender
    );
  }

  function receiveItem(
    uint saleID
  ) public {
    SellerContract.buyerReceiveProduct(saleID);
  }

  function checkPurchaseStatus(
    uint saleID
  ) public view returns(
    string memory status
  ) {
    return SellerContract.getSaleStatus(saleID);
  }

  function checkCourierStatus(
    uint itemID
  ) public view returns(
    string memory status
  ) {
    return CourierContract.getItemStatus(itemID);
  }

  function checkCourierLocation(
    uint itemID
  ) public view returns(
    string memory location
  ) {
    return CourierContract.getItemLocation(itemID);
  }
}