module examples::single_value_schema {
    use examples::world;
	use examples::events;
	use std::option::none;
	use moveos_std::account_storage;
	use moveos_std::context::Context;

	friend examples::example_system;

	const SCHEMA_ID: vector<u8> = b"single_value";
	const SCHEMA_TYPE: u8 = 1;

	// value
	struct SingleValueData has key {
		value: u64
	}

	struct SingleValueDataEvent has drop, store {
		value: u64
	}

	public fun new(value: u64): SingleValueData {
		SingleValueData {
			value
		}
	}

	public fun register(ctx: &mut Context) {
		let _obelisk_schema = new(1000);
        let resource_signer = world::get_resource_signer(ctx);
		account_storage::global_move_to(ctx,&resource_signer, _obelisk_schema);
        // move_to(&resource_signer, _obelisk_schema)

	}

	public(friend) fun set(ctx: &mut Context,value: u64)  {
        // let _obelisk_schema = borrow_global_mut<SingleValueData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SingleValueData>(ctx,address);
		_obelisk_schema.value = value;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, none(), SingleValueDataEvent { value });
	}

	public fun get(ctx: &Context): u64  {
        // let _obelisk_schema = borrow_global<SingleValueData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SingleValueData>(ctx,address);
		(
			_obelisk_schema.value
		)
	}
}
