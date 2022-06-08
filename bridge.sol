// SPDX-License-Identifier: MIT
pragma solidity 0.8.2;


contract BridgePool {
    // using SafeERC20 for IERC20;

	uint256 constant FEE = 0.00025 * 1000; // 2.5%  fee

    function swap(address token, uint256 amount, uint256 targetNetwork, address targetToken)
    external returns(uint256) {
        return _swap(msg.sender, token, amount, targetNetwork, targetToken, msg.sender);
    }

    function swapToAddress(address token,
        uint256 amount,
        uint256 targetNetwork,
        address targetToken,
        address targetAddress)
    external returns(uint256) {
        require(targetAddress != address(0), "BridgePool: targetAddress is required");
        return _swap(msg.sender, token, amount, targetNetwork, targetToken, targetAddress);
    }
    // uint token = 8585858
    // address targetToken = 0xJKLJFLZJFLfafkajl
    // targetNetwork (BSC Chain ID)
    // targetAddress (Wallet Address)
    function _swap(address from, address token, uint256 amount, uint256 targetNetwork,
        address targetToken, address targetAddress) internal returns(uint256) {
		// require(from != address(0), "BP: bad from");
		// require(token != address(0), "BP: bad token");
		require(targetNetwork != 0, "BP: targetNetwork is requried");
		// require(targetToken != address(0), "BP: bad target token");
		require(amount != 0, "BP: bad amount");
		// require(allowedTargets[token][targetNetwork] == targetToken, "BP: target not allowed");
        amount = SafeAmount.safeTransferFrom(token, from, address(this), amount);
        // emit BridgeSwap(from, token, targetNetwork, targetToken, targetAddress, amount);
        return amount;
    }

    function withdrawToken(
            address token,
            address payee,  // receiver
            uint256 amount
            // bytes32 salt,
            // bytes memory signature
            )
    external returns(uint256) {
		require(token != address(0), "BP: bad token");
		require(payee != address(0), "BP: bad payee");
		// require(salt != 0, "BP: bad salt");
		require(amount != 0, "BP: bad amount");
        // bytes32 message = withdrawSignedMessage(token, payee, amount, salt);
        // address _signer = signerUnique(message, signature);
        // require(signers[_signer], "BridgePool: Invalid signer");

        uint256 fee; // 0.25%
        // address _feeDistributor = feeDistributor;
        // if (_feeDistributor != address(0)) {

            fee = amount * FEE / 10000;
            amount = amount - fee;

            // if (fee != 0) {
            //     IERC20(token).safeTransfer(_feeDistributor, fee);
            //     IGeneralTaxDistributor(_feeDistributor).distributeTax(token);
            // }
        // }
        IERC20(token).safeTransfer(payee, amount);
        // emit TransferBySignature(_signer, payee, token, amount, fee);
        return amount;
    }
}