module examples::single_column_schema {
    use moveos_std::table::{Self, Table};
    use examples::world;
	use examples::events;
	use std::option::some;
	use moveos_std::account_storage;
	use moveos_std::context::Context;

	friend examples::example_system;

	/// Entity does not exist
	const EEntityDoesNotExist: u64 = 0;

	const SCHEMA_ID: vector<u8> = b"single_column";
	const SCHEMA_TYPE: u8 = 0;

	// value
	struct SingleColumnData has store {
		value: u64
	}

	struct SingleColumnDataEvent has drop, store {
		value: u64
	}

    struct SchemaData has key {
        value: Table<address, SingleColumnData>
    }

	public fun new(value: u64): SingleColumnData {
		SingleColumnData {
			value
		}
	}

	public fun register(ctx: &mut Context) {
        let _obelisk_schema = SchemaData { value: table::new(ctx) };
        let resource_signer = world::get_resource_signer(ctx);
		account_storage::global_move_to(ctx,&resource_signer, _obelisk_schema);
        // move_to(&resource_signer, _obelisk_schema)
	}

	public(friend) fun set(ctx: &mut Context,_obelisk_entity_key: address,  value: u64)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
		if(table::contains<address, SingleColumnData>(&_obelisk_schema.value, _obelisk_entity_key)) {
			let _obelisk_data = table::borrow_mut<address, SingleColumnData>(&mut _obelisk_schema.value, _obelisk_entity_key);
			_obelisk_data.value = value
		} else {
			table::add(&mut _obelisk_schema.value, _obelisk_entity_key, new(value));
		};
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, some(_obelisk_entity_key), SingleColumnDataEvent { value });
	}

	public fun get(ctx: &Context,_obelisk_entity_key: address): u64  {
		// let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
		let _obelisk_data = table::borrow<address, SingleColumnData>(&_obelisk_schema.value, _obelisk_entity_key);
		(
			_obelisk_data.value
		)
	}

	public(friend) fun remove(ctx: &mut Context,_obelisk_entity_key: address)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
		let _obelisk_data = table::remove(&mut _obelisk_schema.value, _obelisk_entity_key);
		events::emit_remove(ctx,SCHEMA_ID, _obelisk_entity_key);
		let SingleColumnData { value: _value } = _obelisk_data;
	}

	public fun contains(ctx: &Context,_obelisk_entity_key: address): bool  {
        // let _obelisk_schema = borrow_global<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
		table::contains<address, SingleColumnData>(&_obelisk_schema.value, _obelisk_entity_key)
	}
}
