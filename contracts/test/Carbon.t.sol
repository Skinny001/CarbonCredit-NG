// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CarbonProjects.sol";
import "../src/CarbonMarket.sol";
import "./mocks/MockUSDT.sol";

contract CarbonTest is Test {
    CarbonProjects projects;
    CarbonMarket market;
    MockUSDT usdt;

    address admin = address(1);
    address ngo = address(2);
    address verifier = address(3);
    address company = address(4);
    address treasury = address(5);
    address other = address(6);

    function setUp() public {
        vm.startPrank(admin);
        projects = new CarbonProjects("https://api.example.com/tokens/{id}.json");
        usdt = new MockUSDT();
        market = new CarbonMarket(address(projects), address(usdt), treasury, 200); // 2% fee
        
        projects.addNGO(ngo);
        projects.addVerifier(verifier);
        vm.stopPrank();

        usdt.mint(company, 1000000 * 10**18);
    }

    function test_Roles() public {
        assertTrue(projects.hasRole(projects.NGO_ROLE(), ngo));
        assertTrue(projects.hasRole(projects.VERIFIER_ROLE(), verifier));
        
        vm.prank(other);
        vm.expectRevert();
        projects.addNGO(other);
    }

    function test_SubmitAndApproveProject() public {
        vm.startPrank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));
        vm.stopPrank();
        
        CarbonProjects.Project memory p = projects.getProject(id);
        assertEq(p.name, "Test Project");
        assertEq(uint(p.status), uint(CarbonProjects.ProjectStatus.Pending));

        vm.startPrank(verifier);
        projects.approveProject(id, 500); // 500 tonnes
        vm.stopPrank();

        p = projects.getProject(id);
        assertEq(uint(p.status), uint(CarbonProjects.ProjectStatus.Approved));
        assertEq(p.verifiedTonnes, 500);
        assertEq(projects.balanceOf(ngo, id), 500);
    }

    function test_RevertSelfApproval() public {
        vm.prank(admin);
        projects.addVerifier(ngo); // NGO is also a verifier

        vm.prank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));

        vm.prank(ngo);
        vm.expectRevert("self approval");
        projects.approveProject(id, 500);
    }

    function test_RejectProject() public {
        vm.prank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));

        vm.prank(verifier);
        projects.rejectProject(id, bytes32(0));

        CarbonProjects.Project memory p = projects.getProject(id);
        assertEq(uint(p.status), uint(CarbonProjects.ProjectStatus.Rejected));
        assertEq(projects.balanceOf(ngo, id), 0);
    }

    function test_ListingAndBuy(uint256 buyAmount, uint256 pricePerTonne) public {
        buyAmount = bound(buyAmount, 1, 500);
        pricePerTonne = bound(pricePerTonne, 1, 1000000 * 10**18 / 500); // Max affordable by company

        vm.prank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));

        vm.prank(verifier);
        projects.approveProject(id, 500);

        vm.startPrank(ngo);
        projects.setApprovalForAll(address(market), true);
        uint256 listingId = market.createListing(id, 500, pricePerTonne);
        vm.stopPrank();

        assertEq(projects.balanceOf(address(market), id), 500);

        uint256 cost = buyAmount * pricePerTonne;
        uint256 fee = cost * 200 / 10000;

        vm.startPrank(company);
        usdt.approve(address(market), cost);
        market.buy(listingId, buyAmount);
        vm.stopPrank();

        assertEq(projects.balanceOf(company, id), buyAmount);
        assertEq(usdt.balanceOf(treasury), fee);
        assertEq(usdt.balanceOf(ngo), cost - fee);
    }

    function test_CancelListing() public {
        vm.prank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));

        vm.prank(verifier);
        projects.approveProject(id, 500);

        vm.startPrank(ngo);
        projects.setApprovalForAll(address(market), true);
        uint256 listingId = market.createListing(id, 500, 10 * 10**18);
        market.cancelListing(listingId);
        vm.stopPrank();

        assertEq(projects.balanceOf(ngo, id), 500);
        assertFalse(market.getListing(listingId).active);
    }

    function test_Retire() public {
        vm.prank(ngo);
        uint256 id = projects.submitProject("Test Project", "Location", 1000, uint64(block.timestamp), "cid123", bytes32(0));

        vm.prank(verifier);
        projects.approveProject(id, 500);

        vm.startPrank(ngo);
        projects.setApprovalForAll(address(market), true);
        uint256 listingId = market.createListing(id, 500, 10 * 10**18);
        vm.stopPrank();

        vm.startPrank(company);
        usdt.approve(address(market), 100 * 10 * 10**18);
        market.buy(listingId, 100);

        uint256 retirementId = projects.retire(id, 50, "Green Company");
        vm.stopPrank();

        assertEq(projects.balanceOf(company, id), 50); // 100 - 50

        CarbonProjects.Project memory p = projects.getProject(id);
        assertEq(p.retired, 50);

        CarbonProjects.Retirement memory r = projects.getRetirement(retirementId);
        assertEq(r.company, company);
        assertEq(r.amount, 50);
        assertEq(r.companyName, "Green Company");

        (uint256 issued, uint256 retired) = projects.totals();
        assertEq(issued, 500);
        assertEq(retired, 50);
        
        // Check invariant issued - retired == total supply across holders and market
        // Market holds 400. Company holds 50. Total 450.
        // issued (500) - retired (50) == 450.
        uint256 supply = projects.balanceOf(address(market), id) + projects.balanceOf(company, id) + projects.balanceOf(ngo, id);
        assertEq(issued - retired, supply);
    }
}
