// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./GeneralTaxDistributor.sol";

interface IRewardPool {
  function addMarginalReward(address rewardToken) external returns (uint256);
  function addMarginalRewardToPool(address poolId, address rewardToken) external returns (uint256);
}

/**
 * General tax distributor.
 */
contract GeneralTaxDistributorDiscrete {

    struct TokenInfo {
        uint248 bufferSize;
        uint8 tokenSpecificConfig; // 1 or 0
    }

    struct TargetConfig {
        uint8 len; // Max 27 weights
        uint32 totalW;
        uint216 weights;
    }

    enum TargetType {
        NotSet,
        Burn,
        Address,
        DefaultRewardPool,
        CustomRewardPool
    }

    struct TargetInfo {
        address tgt;
        TargetType tType;
    }
    mapping(address => TokenInfo) public tokenInfo;
    mapping(address => TargetConfig) public tokenTargetConfigs;

    TargetConfig public globalTargetConfig;


    function distributeTaxDirect(address token
    ) external override returns (uint256) {
        return _distributeTaxNonRandom(token, token);
    }

    function distributeTaxAvoidOrigin(address token, address origin)
        external
        override
        returns (uint256 amount)
    {
        return _distributeTaxNonRandom(token, origin);
    }

    function _distributeTaxNonRandom(
        address token,
        address origin
    ) internal returns (uint256) {
        // Check balance, if less than buffer
        TokenInfo memory ti = tokenInfo[token];
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance < ti.bufferSize) {
            return 0;
        }

        TargetConfig memory target = ti.tokenSpecificConfig != 0
            ? tokenTargetConfigs[token]
            : globalTargetConfig;
        if (target.len == 0) {
            ti.tokenSpecificConfig = 0;
            target = globalTargetConfig;
        }

        uint256 remaining = balance;
        uint256 w = target.weights;
        for (uint8 i = 0; i < target.len; i++) {
            uint8 mi = 8 * i;
            uint256 mask = 0xff << mi;
            uint256 poolRatio = mask & w;
            poolRatio = poolRatio >> mi;

            uint256 amount = poolRatio * balance / target.totalW;
            if (remaining > amount) {
                remaining -= amount;
            } else {
                amount = remaining;
            }
            if (amount != 0) {
                distributeToTarget(
                        i,
                        ti.tokenSpecificConfig,
                        token,
                        origin,
                        amount
                    );
            }
        }
    }

        function distributeToTarget(
        uint8 idx,
        uint8 fromToken,
        address token,
        address origin,
        uint256 balance
    ) internal returns (uint256) {
        TargetInfo memory tgt = fromToken != 0
            ? tokenTargetInfos[token][idx]
            : targetInfos[idx];
        if (tgt.tgt == origin) {
            return 0;
        }
        if (tgt.tType == TargetType.Burn) {
            IBurnable(token).burn(balance);
            return balance;
        }
        if (tgt.tType == TargetType.Address) {
            IERC20(token).safeTransfer(tgt.tgt, balance);
            return balance;
        }
        if (tgt.tType == TargetType.DefaultRewardPool) {
            IERC20(token).safeTransfer(tgt.tgt, balance);
            return IRewardPool(tgt.tgt).addMarginalReward(token);
        }
        if (tgt.tType == TargetType.CustomRewardPool) {
            IERC20(token).safeTransfer(tgt.tgt, balance);
            address stakeId = poolRoutingTable[token][msg.sender];
            return IRewardPool(tgt.tgt).addMarginalRewardToPool(stakeId, token);
        }
        return 0;
    }
}