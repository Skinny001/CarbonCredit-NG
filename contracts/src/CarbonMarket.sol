// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CarbonMarket is ERC1155Holder, ReentrancyGuard {
    using SafeERC20 for IERC20;
    struct Listing { uint256 id; address seller; uint256 projectId; uint256 amount; uint256 pricePerTonne; bool active; }
    IERC1155 public immutable credits; IERC20 public immutable usdt; address public treasury; uint256 public feeBps; uint256 public nextListingId = 1;
    mapping(uint256 => Listing) private listings;
    event ListingCreated(uint256 indexed id, address indexed seller, uint256 indexed projectId, uint256 amount, uint256 pricePerTonne);
    event Purchased(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 cost);
    event ListingCancelled(uint256 indexed listingId); event PriceUpdated(uint256 indexed listingId, uint256 price);
    constructor(address credits_, address usdt_, address treasury_, uint256 feeBps_) { require(feeBps_ <= 1000, "fee too high"); credits = IERC1155(credits_); usdt = IERC20(usdt_); treasury = treasury_; feeBps = feeBps_; }
    function createListing(uint256 projectId, uint256 amount, uint256 pricePerTonne) external returns (uint256 id) { require(amount > 0 && pricePerTonne > 0, "invalid listing"); credits.safeTransferFrom(msg.sender, address(this), projectId, amount, ""); id = nextListingId++; listings[id] = Listing(id, msg.sender, projectId, amount, pricePerTonne, true); emit ListingCreated(id, msg.sender, projectId, amount, pricePerTonne); }
    function buy(uint256 id, uint256 amount) external nonReentrant { Listing storage listing = listings[id]; require(listing.active && amount > 0 && amount <= listing.amount, "invalid purchase"); uint256 cost = amount * listing.pricePerTonne; uint256 fee = cost * feeBps / 10000; listing.amount -= amount; if (listing.amount == 0) listing.active = false; usdt.safeTransferFrom(msg.sender, treasury, fee); usdt.safeTransferFrom(msg.sender, listing.seller, cost - fee); credits.safeTransferFrom(address(this), msg.sender, listing.projectId, amount, ""); emit Purchased(id, msg.sender, amount, cost); }
    function cancelListing(uint256 id) external nonReentrant { Listing storage listing = listings[id]; require(listing.active && listing.seller == msg.sender, "not seller"); listing.active = false; credits.safeTransferFrom(address(this), msg.sender, listing.projectId, listing.amount, ""); emit ListingCancelled(id); }
    function updatePrice(uint256 id, uint256 newPrice) external { Listing storage listing = listings[id]; require(listing.active && listing.seller == msg.sender, "not seller"); require(newPrice > 0, "zero price"); listing.pricePerTonne = newPrice; emit PriceUpdated(id, newPrice); }
    function getListing(uint256 id) external view returns (Listing memory) { return listings[id]; }
    function listActive(uint256 offset, uint256 limit) external view returns (Listing[] memory result) { uint256 count; for (uint256 i=1; i<nextListingId; i++) if (listings[i].active) count++; if (offset >= count) return new Listing[](0); uint256 size = count-offset < limit ? count-offset : limit; result = new Listing[](size); uint256 seen; uint256 written; for (uint256 i=1; i<nextListingId && written<size; i++) if (listings[i].active) { if (seen++ >= offset) result[written++] = listings[i]; } }
}
