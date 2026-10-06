// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract CarbonProjects is ERC1155, AccessControl {
    bytes32 public constant ADMIN_ROLE = DEFAULT_ADMIN_ROLE;
    bytes32 public constant NGO_ROLE = keccak256("NGO_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum ProjectStatus { Pending, Approved, Rejected }
    struct Project { uint256 id; address ngo; string name; string location; uint32 treesPlanted; uint64 plantedAt; string evidenceCid; bytes32 evidenceHash; uint256 verifiedTonnes; ProjectStatus status; uint256 retired; }
    struct Retirement { uint256 id; address company; uint256 projectId; uint256 amount; string companyName; uint64 timestamp; }

    uint256 public nextProjectId = 1;
    uint256 public nextRetirementId = 1;
    uint256 public totalIssued;
    uint256 public totalRetired;
    mapping(uint256 => Project) private projects;
    mapping(uint256 => Retirement) private retirements;
    mapping(address => uint256[]) private projectsByNgo;
    mapping(address => uint256[]) private retirementsByCompany;

    event ProjectSubmitted(uint256 indexed id, address indexed ngo);
    event ProjectApproved(uint256 indexed id, uint256 tonnes);
    event ProjectRejected(uint256 indexed id, bytes32 reasonHash);
    event Retired(uint256 indexed retirementId, address indexed company, uint256 indexed projectId, uint256 amount);

    constructor(string memory uri_) ERC1155(uri_) { _grantRole(ADMIN_ROLE, msg.sender); }
    function addNGO(address account) external onlyRole(ADMIN_ROLE) { grantRole(NGO_ROLE, account); }
    function removeNGO(address account) external onlyRole(ADMIN_ROLE) { revokeRole(NGO_ROLE, account); }
    function addVerifier(address account) external onlyRole(ADMIN_ROLE) { grantRole(VERIFIER_ROLE, account); }
    function removeVerifier(address account) external onlyRole(ADMIN_ROLE) { revokeRole(VERIFIER_ROLE, account); }

    function submitProject(string calldata name, string calldata location, uint32 treesPlanted, uint64 plantedAt, string calldata evidenceCid, bytes32 evidenceHash) external onlyRole(NGO_ROLE) returns (uint256 id) {
        id = nextProjectId++;
        projects[id] = Project(id, msg.sender, name, location, treesPlanted, plantedAt, evidenceCid, evidenceHash, 0, ProjectStatus.Pending, 0);
        projectsByNgo[msg.sender].push(id);
        emit ProjectSubmitted(id, msg.sender);
    }
    function approveProject(uint256 id, uint256 verifiedTonnes) external onlyRole(VERIFIER_ROLE) {
        Project storage project = projects[id]; require(project.id != 0, "project missing"); require(project.status == ProjectStatus.Pending, "not pending"); require(verifiedTonnes > 0, "zero tonnes"); require(project.ngo != msg.sender, "self approval");
        project.verifiedTonnes = verifiedTonnes; project.status = ProjectStatus.Approved; totalIssued += verifiedTonnes; _mint(project.ngo, id, verifiedTonnes, ""); emit ProjectApproved(id, verifiedTonnes);
    }
    function rejectProject(uint256 id, bytes32 reasonHash) external onlyRole(VERIFIER_ROLE) { Project storage project = projects[id]; require(project.id != 0, "project missing"); require(project.status == ProjectStatus.Pending, "not pending"); project.status = ProjectStatus.Rejected; emit ProjectRejected(id, reasonHash); }
    function retire(uint256 projectId, uint256 amount, string calldata companyName) external returns (uint256 retirementId) { Project storage project = projects[projectId]; require(project.status == ProjectStatus.Approved, "not approved"); require(amount > 0, "zero amount"); _burn(msg.sender, projectId, amount); project.retired += amount; totalRetired += amount; retirementId = nextRetirementId++; retirements[retirementId] = Retirement(retirementId, msg.sender, projectId, amount, companyName, uint64(block.timestamp)); retirementsByCompany[msg.sender].push(retirementId); emit Retired(retirementId, msg.sender, projectId, amount); }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getProject(uint256 id) external view returns (Project memory) { return projects[id]; }
    function listProjects(uint256 offset, uint256 limit) external view returns (Project[] memory result) { uint256 end = offset + limit; if (end > nextProjectId - 1) end = nextProjectId - 1; if (end < offset) return new Project[](0); result = new Project[](end - offset); for (uint256 i = offset; i < end; i++) result[i-offset] = projects[i+1]; }
    function getRetirement(uint256 id) external view returns (Retirement memory) { return retirements[id]; }
    function retirementsOf(address account) external view returns (uint256[] memory) { return retirementsByCompany[account]; }
    function projectsOf(address account) external view returns (uint256[] memory) { return projectsByNgo[account]; }
    function totals() external view returns (uint256 issued, uint256 retired) { return (totalIssued, totalRetired); }
}
