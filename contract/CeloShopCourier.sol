// SPDX-License-Identifier: Apache-2.0

pragma solidity >= 0.7.0 < 0.9.0;

interface CourierInterface {
  function startItemTranpost(string calldata _sku, address _buyer) external;
  function getItemStatus(uint256 itemID) external view returns(string memory status);
  function getItemLocation(uint256 itemID) external view returns(string memory location);
}

contract CeloShopCourier {

  struct Item {
    uint id;
    bool exists;
    string sku;
    string status;
    string location;
    address buyer;
    uint timestamp;
  }

  uint public itemCount = 0;
  mapping(uint => Item) deliveries;
  address internal owner = msg.sender;

  event startItemTranpostEvent(
    uint    id,
    string  sku,
    string  status,
    string  location,
    address buyer,
    uint    timestamp
  );

  event changeItemLocationEvent(
    uint timestamp,
    string status,
    string location
  );

  event deliverItemEvent(
    uint timestamp,
    string status,
    string location
  );

  modifier onlyOwner {
    require(msg.sender == owner, "CeloShop Courier Only Function");
    _;
  }

  function increateItemCount() internal {
    itemCount++;
  }

  function startItemTranpost(
    string calldata _sku,
    address _buyer
  ) external {
    Item memory newDelivery = Item(
      itemCount,
      true,
      _sku,
      "In Transit",
      "Courier Office",
      _buyer,
      block.timestamp
    );
    deliveries[itemCount] = newDelivery;

    increateItemCount();

    emit startItemTranpostEvent(
      newDelivery.id,
      newDelivery.sku,
      newDelivery.status,
      newDelivery.location,
      newDelivery.buyer,
      newDelivery.timestamp
    );
  }

  function getItem(
    uint itemID
  ) public view returns(
    uint id,
    string memory sku,
    string memory status,
    string memory location,
    address buyer,
    uint timestamp
  ) {
    require(deliveries[itemID].exists, "Courier Item Not Found");

    Item storage item = deliveries[itemID];
    return(
      item.id,
      item.sku,
      item.status,
      item.location,
      item.buyer,
      item.timestamp
    );
  }

  function changeItemLocation(
    uint itemID,
    string memory city
  ) onlyOwner public {
    require(deliveries[itemID].exists, "Courier Item Not Found");

    Item storage item = deliveries[itemID];
    item.status = "On the way";
    item.location = city;
    item.timestamp = block.timestamp;

    emit changeItemLocationEvent(
      item.timestamp,
      item.status,
      item.location
    );
  }

  function deliverItem(
    uint itemID,
    string memory city
  ) onlyOwner public {
    require(deliveries[itemID].exists, "Courier Item Not Found");

    Item storage item = deliveries[itemID];
    item.status = "Delivered";
    item.location = city;
    item.timestamp = block.timestamp;

    emit deliverItemEvent(
      item.timestamp,
      item.status,
      item.location
    );
  }

  function getItemStatus(
    uint itemID
  ) external view returns(
    string memory status
  ) {
    require(deliveries[itemID].exists, "Courier Item Not Found");
    Item storage item = deliveries[itemID];

    require(tx.origin == item.buyer, "Product Buyer Only Function");
    return item.status;
  }

  function getItemLocation(
    uint itemID
  ) external view returns(
    string memory location
  ) {
    require(deliveries[itemID].exists, "Courier Item Not Found");
    Item storage item = deliveries[itemID];

    require(tx.origin == item.buyer, "Product Buyer Only Function");
    return item.location;
  }
}