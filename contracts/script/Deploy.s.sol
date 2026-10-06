// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/CarbonProjects.sol";
import "../src/CarbonMarket.sol";
import "../test/mocks/MockUSDT.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy CarbonProjects
        CarbonProjects projects = new CarbonProjects("https://api.example.com/tokens/{id}.json");
        
        // Deploy MockUSDT since the real testnet USDT address is not easily verifiable or we might need it for demo
        MockUSDT usdt = new MockUSDT();
        
        // Setup CarbonMarket with a 2% fee (200 basis points) going to the deployer (treasury)
        address treasury = vm.addr(deployerPrivateKey);
        CarbonMarket market = new CarbonMarket(address(projects), address(usdt), treasury, 200);

        vm.stopBroadcast();

        console.log("CarbonProjects deployed to:", address(projects));
        console.log("CarbonMarket deployed to:", address(market));
        console.log("MockUSDT deployed to:", address(usdt));
    }
}
