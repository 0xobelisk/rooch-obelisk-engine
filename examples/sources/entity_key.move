module examples::entity_key {
    use std::vector;
    use moveos_std::address::from_bytes as address_from_bytes;
    use moveos_std::context::{fresh_address as generate_auid_address, Context};
    use rooch_framework::account::create_resource_address;
    use rooch_framework::bcs::to_bytes;
    use moveos_std::signer::address_of;
    use rooch_framework::hash::keccak256;



    public fun from_signer(signer: &signer): address {
        address_of(signer)
    }


    public fun from_bytes(bytes: &vector<u8>): address {
        address_from_bytes(keccak256(bytes))
    }


    public fun from_u256(x: u256): address {
        let vec:&vector<u8> = &b"u256";
        vector::append(&mut *vec, to_bytes<u256>(&x));
        address_from_bytes(keccak256(vec))
    }

    public fun from_address_with_seed(addr: address, seed: vector<u8>): address {
        create_resource_address(&addr, seed)
    }

    public fun from_auid(ctx: &mut Context): address {
        generate_auid_address(ctx)
    }

    #[test]
    public fun test_from_bytes() {
        assert!(from_bytes(&b"Hello") == @0x6b3dfaec148fb1bb2b066f10ec285e7c9bf402ab32aa78a5d38e34566810cd2, 0);
    }

    #[test]
    public fun test_from_u256() {
        assert!(from_u256(0) == @0x6fb7527d4ec554090560f8e755bea6dafac385cbf0389f22c6c7ecb36ced686, 0);
    }

    #[test]
    public fun test_from_address_with_seed() {
        assert!(from_address_with_seed(@0x1,b"test") == @0x86125c897924b6a6096b88ebd53f76e85f5147c103a04bc9c1ee23c8ae827e1c, 0);
    }

}
