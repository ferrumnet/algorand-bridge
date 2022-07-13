from pyteal import *
from bridge import *
# has_value = Keccak256 message hash 
# signature = eth generated signature from signer

# uint8 len; // Max 27 weights
# uint32 totalW;
# uint216 weights;
len = Bytes("len")
token_target_len = Bytes("token_target_len")
global_len = Bytes("global_len")
global_target_len = Bytes("token_target_len")
totalW = Bytes("totalW")
token_target_totalW = Bytes("token_target_totalW")
global_totalW = Bytes("global_totalW")
global_target_totalW = Bytes("token_target_totalW")
weights = Bytes("weights")
token_target_weights = Bytes("token_target_weights")
global_weights = Bytes("global_weights")
global_target_weights = Bytes("token_target_weights")

target_len = Bytes("target_len")
target_totalW = Bytes("target_totalW")
target_weights = Bytes("target_weights")
target_type = Bytes("target_type")
target = Bytes("target")

# uint248 bufferSize;
# uint8 tokenSpecificConfig; // 1 or 0
buffer_size = Bytes("buffer_size")
token_buffer_size = Bytes("token_buffer")
token_config = Bytes("token_config")
token_specific_config = Bytes("token_specific_config")

@Subroutine(TealType.none)
def execute_asset_transfer(token, token_amount, token_receiver) -> Expr:
        return Seq([
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields({
                TxnField.type_enum: TxnType.AssetTransfer,
                TxnField.xfer_asset: token,
                TxnField.asset_amount: token_amount,
                TxnField.asset_receiver: token_receiver,
                TxnField.fee: Int(0),
                }),
            InnerTxnBuilder.Submit()
        ])

@Subroutine(TealType.uint64)
def distribute_tax_Direct(token):
    return distribute_tax_non_Random(token, token)

@Subroutine(TealType.uint64)
def distribute_tax_avoid_origin(token, origin):
    return distribute_tax_non_Random(token, origin)


@Subroutine(TealType.none)
def distribute_tax_non_Random(token, origin):
    amount = ScratchVar(TealType.uint64)
    balance = ScratchVar(TealType.uint64)
    remaining = ScratchVar(TealType.uint64)
    w = ScratchVar(TealType.uint64)
    i = ScratchVar(TealType.uint64)
    mi = ScratchVar(TealType.uint64)
    mask = ScratchVar(TealType.uint64)
    poolRatio = ScratchVar(TealType.uint64)
    token_specific_config_val = ScratchVar(TealType.uint64)
    return Seq([
        # Check balance, if less than buffer
        # TokenInfo memory ti = tokenInfo[token];

        # uint256 balance = IERC20(token).balanceOf(address(this));
        # if (balance < ti.bufferSize) {
        #     return 0;
        # }

        App.globalPut(Concat(token_buffer_size, Itob(token)), App.globalGet(buffer_size)),
        App.globalPut(Concat(token_specific_config, Itob(token)) , App.globalGet(token_config)),

        holding := AssetHolding.balance(Global.current_application_address(), token),
        Assert(holding.hasValue()),
        balance.store(holding.value()),

        If(balance.load() < App.globalGet(token_buffer_size),
            Reject(),
        ),

        # TargetConfig memory target = ti.tokenSpecificConfig != 0
        #     ? tokenTargetConfigs[token]
        #     : globalTargetConfig;

        If(App.globalGet(Concat(token_specific_config, Itob(token))) != 0)
            .Then(
            App.globalPut(Concat(token_target_len, Itob(token)), App.globalGet(len)),
            App.globalPut(Concat(token_target_totalW, Itob(token)), App.globalGet(totalW)),
            App.globalPut(Concat(token_target_weights, Itob(token)), App.globalGet(weights)),

            App.globalPut(target_len, App.globalGet(Concat(token_target_len, Itob(token)))),
            App.globalPut(target_totalW, App.globalGet(Concat(token_target_totalW, Itob(token)))),
            App.globalPut(target_weights, App.globalGet(Concat(token_target_weights, Itob(token)))),
            )
            .Else(
            App.globalPut(global_target_len, App.globalGet(global_len)),
            App.globalPut(global_target_totalW, App.globalGet(global_totalW)),
            App.globalPut(global_target_weights, App.globalGet(global_weights)),

            App.globalPut(target_len, App.globalGet(global_target_len)),
            App.globalPut(target_totalW, App.globalGet(global_target_totalW)),
            App.globalPut(target_weights, App.globalGet(global_target_weights)),
            ),

        # if (target.len == 0) {
        #     ti.tokenSpecificConfig = 0;
        #     target = globalTargetConfig;
        # }

            If(App.globalGet(target_len) == 0)
            .Then(
                App.globalPut(Concat(token_specific_config, Itob(token)) , Int(0)),

                App.globalPut(global_target_len, App.globalGet(global_len)),
                App.globalPut(global_target_totalW, App.globalGet(global_totalW)),
                App.globalPut(global_target_weights, App.globalGet(global_weights)),

                App.globalPut(target_len, App.globalGet(global_target_len)),
                App.globalPut(target_totalW, App.globalGet(global_target_totalW)),
                App.globalPut(target_weights, App.globalGet(global_target_weights)),

            ),

            token_specific_config_val.store(App.globalGet(Concat(token_specific_config, Itob(token)))),

            remaining.store(balance.load()),
            w.store(App.globalGet(target_weights)),

            i.store(Int(0)),
            For(i.store(Int(0)), i.load() < App.globalGet(target_len), i.store(i.load() + Int(1))).Do(
                    mi.store(8 * i.load()),
                    mask.store(ShiftLeft(0xff, mi.load())),
                    poolRatio.store(BitwiseAnd(mask.load(), w.load())),
                    poolRatio.store(ShiftRight(poolRatio.load(), mi.load())),


            # amount = poolRatio * balance / target.totalW
            amount.store(poolRatio.load() * balance.load() / App.globalGet(target_totalW)),

            If(remaining.load() > amount.load(),
                remaining.store(remaining.load() - amount.load()),
                amount.store(remaining.load()),
            ),

            If(amount.load() != 0,
                distribute_to_target(
                        i.load(),
                        token_specific_config_val.load(),
                        token,
                        origin,
                        amount.load()
                    ),
            ),
            ),

    ])


@Subroutine(TealType.none)
def distribute_to_target(idx, fromToken, token, origin, balance):
    targetType = ScratchVar(TealType.bytes)
    return Seq([

            # TargetInfo memory tgt = fromToken != 0
            # ? tokenTargetInfos[token][idx]
            # : targetInfos[idx];


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