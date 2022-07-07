from pyteal import *


# has_value = Keccak256 message hash 
# signature = eth generated signature from signer

@Subroutine(TealType.uint64)
def distribute_tax_Direct(token):
    return distribute_tax_non_Random(token, token)

@Subroutine(TealType.uint64)
def distribute_tax_avoid_origin(token, origin):
    return distribute_tax_non_Random(token, origin)


@Subroutine(TealType.none)
def distribute_tax_non_Random(token, origin):
    return Seq([

    ])