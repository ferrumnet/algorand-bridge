from pyteal import *

def approval_program():

# Global States

    application_admin = Bytes("application_admin")
    token = Bytes("token")
    token_target_len = Bytes("token_target_len")
    token_target_totalW = Bytes("token_target_totalW")
    token_target_weights = Bytes("token_target_weights")

    global_target_len = Bytes("global_target_len")
    global_target_totalW = Bytes("global_target_totalW")
    global_target_weights = Bytes("global_target_weights")

    target_len = Bytes("target_len")
    target_totalW = Bytes("target_totalW")
    target_weights = Bytes("target_weights")

    token_target_info = Bytes("token_target_info")
    target_info = Bytes("target_info")

    # uint248 bufferSize;
    # uint8 tokenSpecificConfig; // 1 or 0
    token_buffer_size = Bytes("token_buffer")
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

    @Subroutine(TealType.none)
    def init_token_info(token, buffer_size, token_config):
        return Seq([
            # tokenBufferSize[token] = bufferSize;
            App.globalPut(Concat(token_buffer_size, Itob(token)), buffer_size),    
            # tokenSpecificConfig[token] = tokenConfig;
            App.globalPut(Concat(token_specific_config, Itob(token)), token_config),
        ])

    @Subroutine(TealType.none)
    def init_token_target_config(token, len, totalW):
        return Seq([
            # tokenTargetLenght[token] = len;
            App.globalPut(Concat(token_target_len, Itob(token)), len),
            App.globalPut(Concat(token_target_totalW, Itob(token)), totalW),
           
        ])

    @Subroutine(TealType.none)
    def init_global_target_config(global_len, global_totalW):
        return Seq([
            # globalTargetLen = len;
            App.globalPut(global_target_len, global_len),
            App.globalPut(global_target_totalW, global_totalW),
        ])

    @Subroutine(TealType.none)
    def init_global_target_weights(global_weights, count):
        return Seq([
            App.globalPut(Concat(global_target_weights, Itob(count)), global_weights),
        ])

    @Subroutine(TealType.none)
    def init_token_target_info(token, target, target_type, weights, count):
        return Seq([
            # tokenTargetInfo[token] = target;
                App.globalPut(Concat(token_target_info, Itob(token), Itob(count)), target),
                # tokenTargetType[token][target] = targetType; (address)
                App.globalPut(Concat(token_target_info, Itob(token), target), target_type),
                App.globalPut(Concat(token_target_weights, Itob(token), Itob(count)), weights),
        ])

    @Subroutine(TealType.none)
    def init_target_info(target, target_type, count):
        return Seq([
            App.globalPut(Concat(target_info, Itob(count)), target),
            App.globalPut(Concat(target_info, target), target_type),
        ])

    @Subroutine(TealType.none)
    def distribute_tax(token, origin):
        amount = ScratchVar(TealType.uint64)
        balance = ScratchVar(TealType.uint64)
        remaining = ScratchVar(TealType.uint64)
        w = ScratchVar(TealType.uint64)
        i = ScratchVar(TealType.uint64)
        count = ScratchVar(TealType.uint64)
        token_specific_config_val = ScratchVar(TealType.uint64)
        config = ScratchVar(TealType.uint64)
        tokenBufferSize = ScratchVar(TealType.uint64)
        return Seq([
            holding := AssetHolding.balance(Global.current_application_address(), token),
            Assert(holding.hasValue()),
            balance.store(holding.value()),
            tokenBufferSize.store(App.globalGet(Concat(token_buffer_size, Itob(token)))),

            If(balance.load() < tokenBufferSize.load(),
                Reject(),
            ),

            config.store(App.globalGet(Concat(token_specific_config, Itob(token)))),
            If(config.load() != Int(0))
                .Then(
                Seq(
                App.globalPut(target_len, App.globalGet(Concat(token_target_len, Itob(token)))),
                App.globalPut(target_totalW, App.globalGet(Concat(token_target_totalW, Itob(token)))),
                
                count.store(Int(0)),
                For(count.store(Int(0)), count.load() < App.globalGet(target_len), count.store(count.load() + Int(1))).Do(
                    App.globalPut(Concat(target_weights, Itob(count.load())), App.globalGet(Concat(token_target_weights, Itob(token), Itob(count.load())))),
                ),
                )
                )
                .Else(
                Seq(
                App.globalPut(target_len, App.globalGet(global_target_len)),
                App.globalPut(target_totalW, App.globalGet(global_target_totalW)),

                count.store(Int(0)),
                For(count.store(Int(0)), count.load() < App.globalGet(target_len), count.store(count.load() + Int(1))).Do(
                    App.globalPut(Concat(target_weights, Itob(count.load())), App.globalGet(Concat(global_target_weights, Itob(count.load())))),
                ),
                )
                ),

                If(App.globalGet(target_len) == Int(0))
                .Then(
                Seq(
                    App.globalPut(Concat(token_specific_config, Itob(token)), Int(0)),
                    App.globalPut(target_len, App.globalGet(global_target_len)),
                    App.globalPut(target_totalW, App.globalGet(global_target_totalW)),

                count.store(Int(0)),
                For(count.store(Int(0)), count.load() < App.globalGet(target_len), count.store(count.load() + Int(1))).Do(
                    App.globalPut(Concat(target_weights, Itob(count.load())), App.globalGet(Concat(global_target_weights, Itob(count.load())))),
                ),
                )
                ),

                token_specific_config_val.store(App.globalGet(Concat(token_specific_config, Itob(token)))),

                remaining.store(balance.load()),
                

                i.store(Int(0)),
                For(i.store(Int(0)), i.load() < App.globalGet(target_len), i.store(i.load() + Int(1))).Do(
                    Seq(
                        w.store(App.globalGet(Concat(target_weights, Itob(i.load())))),

                       amount.store(balance.load() * w.load() / App.globalGet(target_totalW)),

                        # amount = 1000 * 7/10 


                        If(remaining.load() > amount.load(),
                            remaining.store(remaining.load() - amount.load()),
                            amount.store(remaining.load()),
                        ),

                        If(amount.load() != Int(0),
                            distribute_to_target(
                                    i.load(),
                                    token_specific_config_val.load(),
                                    token,
                                    origin,
                                    amount.load()
                                ),
                        ),
                    )
                ),

        ])


    @Subroutine(TealType.none)
    def distribute_to_target(i, fromToken, token, origin, balance):
        targetType = ScratchVar(TealType.bytes)
        targetAddress = ScratchVar(TealType.bytes)
        return Seq([
            If(fromToken != Int(0))
                .Then(
                Seq(
                targetAddress.store(App.globalGet(Concat(token_target_info, Itob(token), Itob(i)))),
                targetType.store(App.globalGet(Concat(token_target_info, Itob(token), targetAddress.load()))),
                )
                )
                .Else(
                Seq(
                targetAddress.store(App.globalGet(Concat(target_info, Itob(i)))),
                targetType.store(App.globalGet(Concat(target_info, targetAddress.load()))),
                )
                ),

            If(targetAddress.load() == origin,
                Reject(),
            ),
            # If(targetType.load() == Bytes("burn"),
            #     execute_asset_transfer(token, balance, Global.zero_address()),
            # ),
            If(targetType.load() == Bytes("address"),
                execute_asset_transfer(token, balance, targetAddress.load()),
            ),
        ])

    # CONSTRUCTOR
    _token = Btoi(Txn.application_args[0])
    _global_len = Btoi(Txn.application_args[1]) # Max 27 weights
    _global_totalW = Btoi(Txn.application_args[2])
    # _global_weights = Btoi(Txn.application_args[3])
    on_creation = Seq(
        Assert(Global.group_size() == Int(1)),
        App.globalPut(token, _token),
        App.globalPut(application_admin, Txn.sender()),
        init_global_target_config(_global_len, _global_totalW),
        Approve(),
    )

    _token = Btoi(Txn.application_args[1])
    _buffer_size = Btoi(Txn.application_args[2])
    _token_config = Btoi(Txn.application_args[3])  # 0/1
    on_init_token_info = Seq(
        init_token_info(_token, _buffer_size, _token_config),
        Approve(),
    )

    _token = Btoi(Txn.application_args[1])
    _target = Txn.accounts[1]  
    _target_type = Txn.application_args[2]
    _count = Btoi(Txn.application_args[3])
    _weights = Btoi(Txn.application_args[4])
    on_init_token_target_info = Seq(
        init_token_target_info(_token, _target, _target_type, _weights, _count),
        Approve(),
    )

    _target = Txn.accounts[1]
    _target_type = Txn.application_args[1] 
    _count = Btoi(Txn.application_args[2])
    on_init_target_info = Seq(
        init_target_info(_target, _target_type, _count),
        Approve(),
    )


    _token = Btoi(Txn.application_args[1])
    _len = Btoi(Txn.application_args[2])  # Max 27 weights
    _totalW = Btoi(Txn.application_args[3])
    
    on_init_token_target_config = Seq(
        init_token_target_config(_token, _len, _totalW),
        Approve(),
    )
    _count = Btoi(Txn.application_args[1])
    _weights = Btoi(Txn.application_args[2])
    on_init_global_target_weights = Seq(
        init_global_target_weights(_weights, _count),
        Approve(),
    )
    
    on_distribute_tax = Seq(
        distribute_tax(App.globalGet(token), Txn.sender()),
        Approve(),
    )

    is_application_admin = Assert(Txn.sender() == App.globalGet(application_admin))
    on_setup = Seq(
        is_application_admin,
        # OPT-IN to Token from Application. 
        execute_asset_transfer(App.globalGet(token), Int(0), Global.current_application_address()),
        Approve(),
    )

    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("setup"), on_setup],
# Owner Only operations
        [on_call_method == Bytes("distribute-tax"), on_distribute_tax],
# Init Values 
        [on_call_method == Bytes("token-info"), on_init_token_info],
        [on_call_method == Bytes("global-target-weight"), on_init_global_target_weights], 
        [on_call_method == Bytes("token-target-config"), on_init_token_target_config],
        [on_call_method == Bytes("target-info"), on_init_target_info],
        [on_call_method == Bytes("token-target-info"), on_init_token_target_info],        
    )
    on_delete = Seq([ 
        Reject(),
    ])
    on_update = Seq([ 
        Approve(),
    ])

    program = Cond(
        # Application Creation Call would be routed here.
        [Txn.application_id() == Int(0), on_creation],

         # All General Application calls will be routed here.
        [Txn.on_completion() == OnComplete.NoOp, on_call],
        # Reject DELETE and UPDATE Application Calls.
        [Txn.on_completion() == OnComplete.UpdateApplication, on_update],
        [Txn.on_completion() == OnComplete.DeleteApplication, on_delete]
    )

    return compileTeal(program, Mode.Application, version=6)

print(approval_program())