from pyteal import *
from ecdsa import *

def approval_program():

# Global States
    bridge_fee = Bytes("bridge_fee")
    token = Bytes("token")
    buffer = Bytes("buffer")
    signer = Bytes("signer")
    tax_app = Bytes("tax_app")
    target_token = Bytes("target_token")
    application_admin = Bytes("application_admin")
    application_owner = Bytes("application_owner")

# Global States Mapping
    signers = Bytes("signers")
    fee_distributor = Bytes("fee_distributor")
    liquidities = Bytes("liquidities")
    fees = Bytes("fees")
    tax = Bytes("tax")
    used_hash = Bytes("used_hash")
    msg_hash = Bytes("msg_hash")
    signed_message = Bytes("signed_message")
    allowed_targets = Bytes("allowed_targets")

    @Subroutine(TealType.none)
    def real_address(address):
        return Assert(address != Global.zero_address())

# Functions
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
    def is_asset_transfered(asset_id, amount) -> Expr:
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
    def swap_token(_from, _token, _amount, _target_network, _target_token, _target_address):
        targetToken = ScratchVar(TealType.uint64)
        return Seq([
            # Exception("BP: bad from")
            Assert(_from != Global.zero_address()),
            # Exception ("BP: bad amount")
            Assert(_amount > Int(0)),
            # Exception ("BP: targetNetwork is requried")
            Assert(_target_network > Int(0)),
            # require(allowedTargets[token][targetNetwork] == targetToken, "BP: target not allowed")
            
            targetToken.store(App.globalGet(Concat(allowed_targets, Itob(_token), Itob(_target_network)))),
            App.globalPut(target_token, targetToken.load()),
            Assert(App.globalGet(target_token) == _target_token),
            # amount = SafeAmount.safeTransferFrom(token, from, address(this), amount)         
            is_asset_transfered(_token, _amount),
        ])

    @Subroutine(TealType.none)
    def withdraw_token(token, amount, payee, salt, signature, algo_chain_id, msg, msgHash):
        # Scratch Variables
        fee = ScratchVar(TealType.uint64)
        token_amount = ScratchVar(TealType.uint64)
        balance = ScratchVar(TealType.uint64)
        return Seq([
            Assert(Btoi(amount) != Int(0)),
            
            App.globalPut(signed_message, Keccak256(Concat(token, payee, amount, algo_chain_id, salt))),
            Assert(App.globalGet(signed_message) == msg),

            # require(!usedHashes[signed_message], "Message already used");
            # If signed_message exist in (used_hash) returns 1 
            # then stop tx as signed_message is already used
            Assert(App.globalGet(Concat(used_hash, App.globalGet(signed_message))) != Int(1)),

            App.globalPut(msg_hash, msgHash),
            App.globalPut(signer, eth_ecdsa_recover(App.globalGet(msg_hash), signature)),

            # usedHashes[signed_message] = true;
            # Since the signed_messaged is used now add it to 
            # used_hash array as True. 
            App.globalPut(Concat(used_hash, App.globalGet(signed_message)), Int(1)),

            # Verify if the signer exist           
            Assert(App.globalGet(Concat(signers, App.globalGet(signer))) == Int(1)),

            # Logic of Tax distribution
            token_amount.store(Btoi(amount)),
            fee.store(Btoi(amount) * App.globalGet(Concat(token, fees)) / Int(10000)),
            token_amount.store(token_amount.load() - fee.load()),
            App.globalPut(tax, fee.load()),
            If( fee.load() != Int(0),
                execute_asset_transfer(Btoi(token), fee.load(), App.globalGet(fee_distributor)),
                #  IGeneralTaxDistributor(_feeDistributor).distributeTax(token);
            ),

            holding := AssetHolding.balance(App.globalGet(fee_distributor), Btoi(token)),
            If(holding.hasValue(),
                Seq(
                    balance.store(holding.value()),

                    If(balance.load() > App.globalGet(buffer),
                        Seq(
                            InnerTxnBuilder.Begin(),
                            InnerTxnBuilder.SetFields({
                                TxnField.type_enum: TxnType.ApplicationCall,
                                TxnField.application_id: App.globalGet(tax_app),
                                TxnField.assets: [Btoi(token)],
                                TxnField.accounts: [Txn.accounts[1], Txn.accounts[2], Txn.accounts[3]],
                                TxnField.on_completion: OnComplete.NoOp,
                                TxnField.application_args: [Bytes("distribute-tax")],
                            }),
                            InnerTxnBuilder.Submit(),
                        ),
                    ),
                ),
            ),
            # Withdraw tokens to the Aglorand receiver
            execute_asset_transfer(Btoi(token), token_amount.load(), Txn.sender()),
        ])

    @Subroutine(TealType.none)
    def add_signer(_signer):
        return Seq([
        App.globalPut(Concat(signers, _signer), Int(1))
    ])

    @Subroutine(TealType.none)
    def remove_signer(_signer):
        return Seq([
        # App.globalPut(Concat(_signer, signers), Int(0))
        App.globalDel(Concat(signers, _signer)),
    ])

    @Subroutine(TealType.none)
    def set_tax_app(app_id):
        return Seq([
        App.globalPut(tax_app, app_id)
    ])

    @Subroutine(TealType.none)
    def set_fee_distributor(_fee_distributor):
        real_address(_fee_distributor)
        return Seq([
        App.globalPut(fee_distributor, _fee_distributor),
    ])

    @Subroutine(TealType.none)
    def set_fee(_token, _fee10000):
        return Seq([
        # require(fee10000 <= MAX_FEE, "Fee too large");
        Assert(_fee10000 <= App.globalGet(bridge_fee)),
        # fees[token] = fee10000;
        App.globalPut(Concat(Itob(_token), fees), _fee10000)
    ])

    @Subroutine(TealType.none)
    def allow_target(_token, _chain_id, _target_token):
        return Seq([
        Assert(_chain_id > Int(0)),

        #  allowedTargets[token][chainId] = targetToken;
        App.globalPut(Concat(allowed_targets, Itob(_token), Itob(_chain_id)), _target_token),
    ])   

    @Subroutine(TealType.none)
    def disallow_target(_token, _chain_id):
        return Seq([
        # require(chainId != 0, "Bad chainId");
        Assert(_chain_id > Int(0)),

        # Need to confirm how to delete the mapping 
        App.globalDel(Concat(allowed_targets, Itob(_token), Itob(_chain_id))),
    ])  

    @Subroutine(TealType.none)
    def add_liquidity(_token, _amount):
        return Seq([
        Assert(_amount != Int(0)),
        # amount = SafeAmount.safeTransferFrom(token, msg.sender, address(this), amount);
        is_asset_transfered(_token, _amount),
        # liquidities[token][msg.sender] = liquidities[token][msg.sender] + amount;
        App.globalPut(Concat(liquidities, Itob(_token), Txn.sender()), App.globalGet(Concat(liquidities, Itob(_token), Txn.sender())) + _amount),
    ])

    @Subroutine(TealType.none)
    def remove_liquidity(_token, _amount):
        # Scratch Variables
        _liq = ScratchVar(TealType.uint64)
        _actual_liq = ScratchVar(TealType.uint64)
        _balance = ScratchVar(TealType.uint64)
        return Seq([
        # require(amount != 0, "Amount must be positive");
        Assert(_amount != Int(0)),

        # uint256 liq = liquidities[token][msg.sender]; 
        _liq.store(App.globalGet(Concat(liquidities, Itob(_token), Txn.sender()))),
        # require(liq >= amount, "Not enough liquidity");
        Assert(_liq.load() >= _amount),
        # uint256 balance = IERC20(token).balanceOf(address(this));
        # _balance.store(AssetHolding.balance(Txn.accounts[0], Txn.assets[0]).value()),
        holding := AssetHolding.balance(Global.current_application_address(), _token),
        Assert(holding.hasValue()),
        _balance.store(holding.value()),

        # uint256 actualLiq = balance > amount ? amount : balance;
        If( _balance.load() > _amount, 
            _actual_liq.store(_amount),
            _actual_liq.store(_balance.load())
        ),
        # liquidities[token][msg.sender] = liquidities[token][msg.sender] - actualLiq;
        App.globalPut(Concat(liquidities, Itob(_token), Txn.sender()), App.globalGet(Concat(liquidities, Itob(_token), Txn.sender())) - _actual_liq.load()),

        If(_actual_liq.load() != Int(0),
            execute_asset_transfer(_token, _actual_liq.load(), Txn.sender()),
        ),
    ])

    # CONSTRUCTOR
    _bridge_fee = Btoi(Txn.application_args[0])
    _token = Btoi(Txn.application_args[1])
    _buffer = Btoi(Txn.application_args[2])
    on_creation = Seq(
        Assert(Global.group_size() == Int(1)),
        App.globalPut(bridge_fee, _bridge_fee),
        App.globalPut(token, _token),
        App.globalPut(buffer, _buffer),
        App.globalPut(application_admin, Txn.sender()),
        App.globalPut(application_owner, Txn.accounts[1]),
        Approve(),
    )

    is_application_admin = Assert(Txn.sender() == App.globalGet(application_admin))
    is_application_owner = Assert(Txn.sender() == App.globalGet(application_owner))

    on_setup = Seq(
        is_application_admin,
        # OPT-IN to Token from Application. 
        execute_asset_transfer(App.globalGet(token), Int(0), Global.current_application_address()),
        Approve(),
    )

    _token = Btoi(Txn.application_args[1])
    _amount = Btoi(Txn.application_args[2])
    _target_network = Btoi(Txn.application_args[3])
    _target_token = Txn.application_args[4]
    _target_address = Txn.application_args[5]
    # Method SWAP
    on_swap = Seq([
        # SWAP TOKEN
        swap_token(Txn.sender(), _token, _amount, _target_network, _target_token, _target_address),
        Approve(),
    ])

    _token = Txn.application_args[1]
    _payee = Txn.application_args[2]
    _amount = Txn.application_args[3]
    _salt = Txn.application_args[4]
    _signature = Txn.application_args[5]
    algo_chain_id = Txn.application_args[6]
    msg = Txn.application_args[7]
    msgHash = Txn.application_args[8]
    # Method WITHDRAW
    on_withdraw = Seq([
        withdraw_token(_token, _amount, _payee, _salt, _signature, algo_chain_id, msg, msgHash),
        Approve(),
    ])

# Owner Only operations
    _signer_address = Txn.application_args[1]
    on_add_signer = Seq([
        is_application_owner,
        add_signer(_signer_address),
        Approve(),
    ])

    _signer_address = Txn.application_args[1]
    on_remove_signer = Seq([
        is_application_owner,
        remove_signer(_signer_address),
        Approve(),
    ])

    _app_id = Btoi(Txn.application_args[1])
    on_set_tax_app = Seq([
        is_application_owner,
        set_tax_app(_app_id),
        Approve(),
    ])

    _fee_distributor = Txn.accounts[1]
    on_set_fee_distributor = Seq([
        is_application_owner,
        set_fee_distributor(_fee_distributor),
        Approve(),
    ])

# Admin Only operations
    _token = Btoi(Txn.application_args[1])
    _fee10000 = Btoi(Txn.application_args[2])
    on_set_fee = Seq([
        is_application_admin,
        set_fee(_token, _fee10000),
        Approve(),
    ])

    _token = Btoi(Txn.application_args[1])
    _chain_id = Btoi(Txn.application_args[2])
    _target_token = Txn.application_args[3]
    on_allow_target = Seq([
        is_application_admin,
        allow_target(_token, _chain_id, _target_token),
        Approve(),
    ])

    _token = Btoi(Txn.application_args[1])
    _chain_id = Btoi(Txn.application_args[2])
    on_disallow_target = Seq([
        is_application_admin,
        disallow_target(_token, _chain_id), 
        Approve(),
    ])

# User Operations
    _token = Btoi(Txn.application_args[1])
    _amount = Btoi(Txn.application_args[2])
    on_add_liquidity = Seq([
        add_liquidity(_token, _amount),
        Approve(),
    ])

    _token = Btoi(Txn.application_args[1])
    _amount = Btoi(Txn.application_args[2])
    on_remove_liquidity = Seq([
        remove_liquidity(_token, _amount),
        Approve(),
    ])

    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("setup"), on_setup],
# Owner Only operations
        [on_call_method == Bytes("add-signer"), on_add_signer],
        [on_call_method == Bytes("remove-signer"), on_remove_signer],
        [on_call_method == Bytes("set-tax-app"), on_set_tax_app],
        [on_call_method == Bytes("set-fee-distributor"), on_set_fee_distributor],
# Admin operations 
        [on_call_method == Bytes("set-fee"), on_set_fee],
        [on_call_method == Bytes("allow-target"), on_allow_target],
        [on_call_method == Bytes("disallow-target"), on_disallow_target],

# Liquidity Management 
        [on_call_method == Bytes("add-liquidity"), on_add_liquidity],
        [on_call_method == Bytes("remove-liquidity"), on_remove_liquidity],

# Swap operations 
        [on_call_method == Bytes("swap"), on_swap],

# Withdraw operations
        [on_call_method == Bytes("withdraw"), on_withdraw]
    )
    on_delete = Seq([ 
        Approve(),
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