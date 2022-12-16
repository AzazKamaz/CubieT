// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

struct Metadata {
    uint256 parentA;
    uint256 parentB;
    bytes8 c_perm;
    bytes8 c_ori;
    bytes12 e_perm;
    bytes12 e_ori;
}

struct MetadataToken {
    uint256 tokenId;
    string tokenUri;
    Metadata metadata;
}

contract CubieT is ERC721, ERC721Enumerable, AccessControl {
    bytes32 public constant SIGNER_ROLE = keccak256("SIGNER_ROLE");

    uint256 private _tokenIdCounter = 100;
    mapping(uint256 => Metadata) _metadata;

    constructor() ERC721("Cubie Token", "CBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://api.bdld.azazkamaz.me/metadata/";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory baseURI = super.tokenURI(tokenId);
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, "/", Base64.encode(abi.encode(_metadata[tokenId])))) : "";
    }

    function mint(address to, uint256 tokenId, bytes calldata metadata, bytes calldata sign) public {
        Metadata memory meta = abi.decode(metadata, (Metadata));

        bytes memory prefix = "\x19Ethereum Signed Message:\n224";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix, abi.encode(tokenId, meta)));
        address signer = ecrecover(prefixedHashMessage, uint8(bytes1(sign[64:65])), bytes32(sign[0:32]), bytes32(sign[32:64]));

        _checkRole(SIGNER_ROLE, signer);

        _safeMint(to, tokenId);
        _metadata[tokenId] = meta;
    }

    function produce(address to, uint256 parentA, uint256 parentB) public {
        require(ownerOf(parentA) == msg.sender, "Not owner of token parentA");
        require(ownerOf(parentB) == msg.sender, "Not owner of token parentB");

        _tokenIdCounter += 1;
        _safeMint(to, _tokenIdCounter);

        Metadata storage inA = _metadata[parentA];
        Metadata storage inB = _metadata[parentB];
        Metadata storage out = _metadata[_tokenIdCounter];

        bytes memory tmp_cp = new bytes(8);
        bytes memory tmp_co = new bytes(8);
        bytes memory tmp_ep = new bytes(12);
        bytes memory tmp_eo = new bytes(12);

        for (uint i = 0; i < 8; i++) {
            tmp_cp[i] = inA.c_perm[uint256(uint8(inB.c_perm[i]))];
            tmp_co[i] = bytes1((uint8(inA.c_ori[uint256(uint8(inB.c_perm[i]))]) + uint8(inB.c_ori[i])) % 3);
        }
        for (uint i = 0; i < 12; i++) {
            tmp_ep[i] = inA.e_perm[uint256(uint8(inB.e_perm[i]))];
            tmp_eo[i] = bytes1((uint8(inA.e_ori[uint256(uint8(inB.e_perm[i]))]) + uint8(inB.e_ori[i])) % 2);
        }

        out.c_perm = bytes8(tmp_cp);
        out.c_ori = bytes8(tmp_co);
        out.e_perm = bytes12(tmp_ep);
        out.e_ori = bytes12(tmp_eo);
    }

    function tokensOfOwner(address owner) public view returns (MetadataToken[] memory) {
        MetadataToken[] memory data = new MetadataToken[](balanceOf(owner));
        for (uint i = 0; i < data.length; i++) {
            uint256 id = tokenOfOwnerByIndex(owner, i);
            data[i] = MetadataToken(id, tokenURI(id), _metadata[id]);
        }
        return data;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
