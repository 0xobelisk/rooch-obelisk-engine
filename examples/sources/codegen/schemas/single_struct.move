module examples::single_struct_schema {
    use examples::world;
	use examples::events;
	use std::option::none;
	use moveos_std::account_storage;
	use moveos_std::context::Context;

	friend examples::example_system;

	const SCHEMA_ID: vector<u8> = b"single_struct";
	const SCHEMA_TYPE: u8 = 1;

	// admin
	// fee
	struct SingleStructData has key {
		admin: address,
		fee: u64
	}

	struct SingleStructDataEvent has drop, store {
		admin: address,
		fee: u64
	}

	public fun new(admin: address, fee: u64): SingleStructData {
		SingleStructData {
			admin,
			fee
		}
	}

	public fun register(ctx: &mut Context) {
		let _obelisk_schema = new(@0x1,100);
        let resource_signer = world::get_resource_signer(ctx);
		account_storage::global_move_to(ctx,&resource_signer, _obelisk_schema);
        // move_to(&resource_signer, _obelisk_schema)
	}

	public(friend) fun set(ctx: &mut Context,admin: address, fee: u64)  {
        // let _obelisk_schema = borrow_global_mut<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SingleStructData>(ctx,address);
		_obelisk_schema.admin = admin;
		_obelisk_schema.fee = fee;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, none(), SingleStructDataEvent { admin, fee });
	}

	public(friend) fun set_admin(ctx: &mut Context,admin: address)  {
        // let _obelisk_schema = borrow_global_mut<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SingleStructData>(ctx,address);
		_obelisk_schema.admin = admin;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, none(), SingleStructDataEvent { admin, fee: _obelisk_schema.fee });
	}

	public(friend) fun set_fee(ctx: &mut Context,fee: u64)  {
        // let _obelisk_schema = borrow_global_mut<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SingleStructData>(ctx,address);
		_obelisk_schema.fee = fee;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, none(), SingleStructDataEvent { admin: _obelisk_schema.admin, fee });
	}

	public fun get(ctx: &Context): (address,u64)  {
        // let _obelisk_schema = borrow_global<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SingleStructData>(ctx,address);
		(
			_obelisk_schema.admin,
			_obelisk_schema.fee,
		)
	}

	public fun get_admin(ctx: &Context): address  {
        // let _obelisk_schema = borrow_global<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SingleStructData>(ctx,address);
        _obelisk_schema.admin
	}

	public fun get_fee(ctx: &Context): u64  {
        // let _obelisk_schema = borrow_global<SingleStructData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SingleStructData>(ctx,address);
		_obelisk_schema.fee
	}
}
