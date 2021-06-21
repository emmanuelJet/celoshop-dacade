// SPDX-License-Identifier: Apache-2.0

pragma solidity >= 0.7.0 < 0.9.0;

import './CeloShopCourier.sol';

interface CeloUSDToken {
  function transfer(address, uint256) external returns (bool);
  function approve(address, uint256) external returns (bool);
  function transferFrom(address, address, uint256) external returns (bool);
  function totalSupply() external view returns (uint256);
  function balanceOf(address) external view returns (uint256);
  function allowance(address, address) external view returns (uint256);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

interface SellerInterface {
  function addSale(uint productID) external;
  function buyerReceiveProduct(uint saleID) external;
  function getProductPrice(uint productID) external view returns(uint price);
  function getSaleStatus(uint saleID) external view returns(string memory status);
}

contract CeloShopSeller {

  struct Product {
    uint id;
    uint sold;
    uint price;
    bool exists;
    string sku;
    string name;
    string image;
    string description;
    address payable seller;
  }

  struct Sale {
    uint id;
    uint amount;
    string  ref;
    string  status;
    address buyer;
    bool    exists;
    address payable seller;
  }

  address celoCourierAddress;
  uint internal productCount = 0;
  uint internal saleCount = 0;
  mapping(uint => Product) products;
  mapping(uint => Sale) transactions;
  address internal cUsdTokenAddress = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

  event addProductEvent(
    uint id,
    uint price,
    string sku,
    string name,
    string image,
    string description,
    address seller
  );

  event sendProductToCourierEvent(
    uint saleID,
    uint productID,
    address seller
  );

  event addSaleEvent(
    uint id,
    uint amount,
    string ref,
    string status,
    address buyer,
    address seller
  );

  event buyerReceiveProductEvent(
    uint saleID,
    address seller,
    address buyer
  );

  constructor(address courierContractAddress) {
    celoCourierAddress = courierContractAddress;
  }

  receive () external payable {}

  function increaseProductCount() internal {
    productCount++;
  }

  function increaseSaleCount() internal {
    saleCount++;
  }

  function compareSKUwithREF(
    string memory _sku,
    string memory _ref
  ) internal pure returns(
    bool
  ) {
    return(keccak256(bytes(_sku)) == keccak256(bytes(_ref)));
  }

  function addProduct(
    uint _price,
    string memory _sku,
    string memory _name,
    string memory _image,
    string memory _description
  ) public {
    uint _sold = 0;

    Product memory newProduct = Product(
      productCount,
      _sold,
      _price,
      true,
      _sku,
      _name,
      _image,
      _description,
      payable(msg.sender)
    );
    products[productCount] = newProduct;
    
    increaseProductCount();

    emit addProductEvent(
      newProduct.id,
      newProduct.price,
      newProduct.sku,
      newProduct.name,
      newProduct.image,
      newProduct.description,
      newProduct.seller
    );
  }

  function getProduct(
    uint productID
  ) public view returns(
    uint id,
    uint sold,
    uint price,
    string memory sku,
    string memory name,
    string memory image,
    string memory description,
    address seller
  ) {
    require(products[productID].exists, "Product Not Found");

    Product storage product = products[productID];
    return(
      product.id,
      product.sold,
      product.price,
      product.sku,
      product.name,
      product.image,
      product.description,
      product.seller
    );
  }

  function getProductPrice(
    uint productID
  ) external view returns(
    uint price
  ) {
    require(products[productID].exists, "Product Not Found");

    return products[productID].price;
  }

  function getProductsLength() public view returns (uint length) {
    return (productCount);
  }

  function sendProductToCourier(
    uint saleID,
    uint productID
  ) public {
    require(products[productID].exists, "Product Not Found");
    require(transactions[saleID].exists, "Sale Transaction Not Found");

    Product storage product = products[productID];
    Sale storage sale = transactions[saleID];

    require(msg.sender == product.seller, "Product Seller Only Function");
    require(compareSKUwithREF(product.sku, sale.ref), "Seller Product not Equal to Sale Item");

    CourierInterface CourierContract = CourierInterface(address(celoCourierAddress));
    CourierContract.startItemTranpost(product.sku, sale.buyer);

    transactions[saleID].status = "In Transit";

    emit sendProductToCourierEvent(
      saleID,
      productID,
      product.seller
    );
  }

  function addSale(
    uint productID
  ) external {
    require(products[productID].exists, "Product Not Found");
    Product storage product = products[productID];

    require(tx.origin != product.seller, "Sorry! You can't purchase your product");

    Sale memory newSale = Sale(
      saleCount,
      product.price,
      product.sku,
      "Paid",
      tx.origin,
      true,
      payable(product.seller)
    );
    transactions[saleCount] = newSale;

    product.sold++;
    increaseSaleCount();

    emit addSaleEvent(
      newSale.id,
      newSale.amount,
      newSale.ref,
      newSale.status,
      newSale.buyer,
      newSale.seller
    );
  }

  function getSale(
    uint saleID
  ) public view returns(
    uint id,
    uint amount,
    string memory ref,
    string memory status,
    address buyer,
    address seller
  ) {
    require(transactions[saleID].exists, "Sale Transaction Not Found");

    Sale storage sale = transactions[saleID];
    return(
      sale.id,
      sale.amount,
      sale.ref,
      sale.status,
      sale.buyer,
      sale.seller
    );
  }

  function getSaleStatus(
    uint saleID
  ) external view returns(
    string memory status
  ) {
    require(transactions[saleID].exists, "Sale Transaction Not Found");
    Sale storage sale = transactions[saleID];

    require(tx.origin == sale.buyer, "Product Buyer Only Function");
    return sale.status;
  }

  function getSalesLength() public view returns (uint length) {
    return (saleCount);
  }

  function buyerReceiveProduct(
    uint saleID
  ) external {
    require(transactions[saleID].exists, "Sale Transaction Not Found");
    Sale storage sale = transactions[saleID];
    
    require(tx.origin == sale.buyer, "Product Buyer Only Function");

    CeloUSDToken(cUsdTokenAddress).transfer(
      sale.seller,
      sale.amount
    );
    sale.status = "Delivered";

    emit buyerReceiveProductEvent(
      saleID,
      sale.buyer,
      sale.seller
    );
  }
}