from pyteal import *
from bridge import execute_asset_transfer
# has_value = Keccak256 message hash 
# signature = eth generated signature from signer

        # uint8 len; // Max 27 weights
        # uint32 totalW;
        # uint216 weights;

len = Bytes("len")
totalW = Bytes("totalW")
weights = Bytes("weights")
target_type = Bytes("target_type")
target = Bytes("target")


@Subroutine(TealType.uint64)
def distribute_tax_Direct(token):
    return distribute_tax_non_Random(token, token)

@Subroutine(TealType.uint64)
def distribute_tax_avoid_origin(token, origin):
    return distribute_tax_non_Random(token, origin)


@Subroutine(TealType.none)
def distribute_tax_non_Random(token, origin):
    amount = ScratchVar(TealType.uint64)
    return Seq([

            If(amount != 0,
                distribute_to_target(
                        i,
                        ti.tokenSpecificConfig,
                        token,
                        origin,
                        amount
                    ),
            ),

    ])


@Subroutine(TealType.none)
def distribute_to_target(idx, fromToken, token, origin, balance):
    targetType = ScratchVar(TealType.bytes)
    return Seq([
        targetType.store("address"),
        App.globalPut(target_type, targetType.load()),

        If(App.globalGet(target) == origin,
            Reject(),
        ),
        If(App.globalGet(target_type) == "address",
            execute_asset_transfer(token, balance, Global.zero_address()),
        ),
        If(App.globalGet(target_type) == "address",
            execute_asset_transfer(token, balance, App.globalGet(target)),
        ),

    ]),