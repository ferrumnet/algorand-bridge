from pyteal import *

def approval_program():
    # Global States
    bridge_fee = Bytes("bridge_fee")
    token = Bytes("token")
    amount = Bytes("amount")
    target_network = Bytes("target_network")
    target_token = Bytes("target_token")
    target_address = Bytes("target_address")
    application_admin = Bytes("application_admin")

# Functions
    @Subroutine(TealType.none)
    def execute_asset_transfer(token: TealType.uint64, token_amount: TealType.uint64, token_receiver: TealType.bytes) -> Expr:
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
    def is_asset_transfered(asset_id: TealType.uint64, amount: TealType.uint64) -> Expr:
        return Assert(
            And(
                Global.group_size() == Int(2),
                Gtxn[0].type_enum() == TxnType.AssetTransfer,
                Gtxn[0].xfer_asset() == asset_id,
                Gtxn[0].sender() == Txn.sender(),
                Gtxn[0].asset_receiver() == Global.current_application_address(),
                Gtxn[0].asset_amount() == amount,
                )
        )


    @Subroutine(TealType.none)
    def swap_token(_token: TealType.uint64, _amount: TealType.uint64, _target_token: TealType.bytes, _target_network: TealType.uint64, _target_address: TealType.bytes):
        return Seq([
            # Exception ("BP: bad amount")
            Assert(_amount > Int(0)),
            # Exception ("BP: targetNetwork is requried")
            Assert(_target_network > Int(0)),
            App.globalPut(amount, _amount),
            App.globalPut(target_token, _target_token),
            App.globalPut(target_network, _target_network),
            App.globalPut(target_address, _target_address),

            # amount = SafeAmount.safeTransferFrom(token, from, address(this), amount);

            # Verify that swapper has transfered assets to the application
            is_asset_transfered(_token, _amount),
        ])

    @Subroutine(TealType.none)
    def withdraw_token(token: TealType.uint64, receiver: TealType.bytes, amount: TealType.uint64):
        # Scratch Variables
        fee = ScratchVar(TealType.uint64)
        token_amount = ScratchVar(TealType.uint64)
        return Seq([
            # Exception ("BP: bad amount")
            Assert(amount > Int(0)),

            # fee = amount * FEE / 10000;
            # amount = amount - fee;

            token_amount.store(amount),
            fee.store(amount * (App.globalGet(bridge_fee) / Int(10000))),

            App.globalPut(bridge_fee, fee.load()),
            token_amount.store(token_amount.load() - fee.load()),

            # IERC20(token).safeTransfer(payee, amount);

            execute_asset_transfer(token, token_amount.load(), receiver)
        ])

    
    # CONSTRUCTOR
    _bridge_fee = Btoi(Txn.application_args[0])
    _token = Btoi(Txn.application_args[1])

    on_creation = Seq(
        Assert(Global.group_size() == Int(1)),
        App.globalPut(bridge_fee, _bridge_fee),
        App.globalPut(token, _token),
        App.globalPut(application_admin, Txn.sender()),
        Approve(),
    )
    # is_application_admin = Assert(Txn.sender() == App.globalGet(application_admin))
    on_setup = Seq(
        # is_application_admin,
        # OPT-IN to Token from Application. 
        execute_asset_transfer(App.globalGet(token), Int(0), Global.current_application_address()),
        Approve(),
    )

    _token = Btoi(Txn.application_args[1])
    _amount = Btoi(Txn.application_args[2])
    _target_token = Txn.application_args[3]
    _target_network = Btoi(Txn.application_args[4])
    _target_address = Txn.application_args[5]

    # Method SWAP
    on_swap = Seq([
        # SWAP TOKEN
        swap_token(_token, _amount, _target_token, _target_network, _target_address),
        Approve(),
    ])

    _token = Btoi(Txn.application_args[1])
    _amount = Btoi(Txn.application_args[2])

    # Method WITHDRAW
    on_withdraw = Seq([
        # is_application_admin,
        withdraw_token(_token, Txn.sender(), _amount),
        Approve(),
    ])

    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("setup"), on_setup],
        [on_call_method == Bytes("swap"), on_swap],
        [on_call_method == Bytes("withdraw"), on_withdraw]
    )
    on_delete = Seq([ 
        Reject(),
    ])
    on_update = Seq([ 
        Reject(),
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

    return compileTeal(program, Mode.Application, version=5)

print(approval_program())