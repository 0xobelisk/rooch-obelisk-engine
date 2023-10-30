module examples::multi_column_schema {
	use moveos_std::table::Table;
    use examples::world;
	use moveos_std::table;
	use examples::events;
	use std::option::some;
	use moveos_std::account_storage;
	use moveos_std::context::Context;

	friend examples::example_system;

	/// Entity does not exist
	const EEntityDoesNotExist: u64 = 0;

	const SCHEMA_ID: vector<u8> = b"multi_column";
	const SCHEMA_TYPE: u8 = 0;

	// state
	// last_update_time
	struct MultiColumnData has store {
		state: vector<u8>,
		last_update_time: u64
	}

	struct MultiColumnDataEvent has drop, store {
		state: vector<u8>,
		last_update_time: u64
	}

    struct SchemaData has key {
        value: Table<address, MultiColumnData>
    }

	public fun new(state: vector<u8>, last_update_time: u64): MultiColumnData {
		MultiColumnData {
			state,
			last_update_time
		}
	}

    public fun register(ctx: &mut Context) {
        let _obelisk_schema = SchemaData { value: table::new(ctx) };
        let resource_signer = world::get_resource_signer(ctx);
		account_storage::global_move_to(ctx,&resource_signer, _obelisk_schema);
        // move_to(&resource_signer, _obelisk_schema)
    }

	public(friend) fun set(ctx: &mut Context,_obelisk_entity_key: address,  state: vector<u8>, last_update_time: u64)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
		if(table::contains<address, MultiColumnData>(&_obelisk_schema.value, _obelisk_entity_key)) {
			let _obelisk_data = table::borrow_mut<address, MultiColumnData>(&mut _obelisk_schema.value, _obelisk_entity_key);
			_obelisk_data.state = state;
			_obelisk_data.last_update_time = last_update_time;
		} else {
			table::add(&mut _obelisk_schema.value, _obelisk_entity_key, new(state, last_update_time));
		};
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, some(_obelisk_entity_key), MultiColumnDataEvent{ state, last_update_time });
	}

	public(friend) fun set_state(ctx: &mut Context,_obelisk_entity_key: address, state: vector<u8>)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
		let _obelisk_data = table::borrow_mut<address, MultiColumnData>(&mut _obelisk_schema.value, _obelisk_entity_key);
		_obelisk_data.state = state;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, some(_obelisk_entity_key), MultiColumnDataEvent{ state, last_update_time: _obelisk_data.last_update_time });
	}

	public(friend) fun set_last_update_time(ctx: &mut Context,_obelisk_entity_key: address, last_update_time: u64)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
        let _obelisk_data = table::borrow_mut<address, MultiColumnData>(&mut _obelisk_schema.value, _obelisk_entity_key);
        _obelisk_data.last_update_time = last_update_time;
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, some(_obelisk_entity_key), MultiColumnDataEvent{ state: _obelisk_data.state, last_update_time });
	}

	#[view]
	public fun get(ctx: &Context,_obelisk_entity_key: address): (vector<u8>,u64)  {
        // let _obelisk_schema = borrow_global<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
        let _obelisk_data = table::borrow<address, MultiColumnData>(&_obelisk_schema.value, _obelisk_entity_key);
		(
			_obelisk_data.state,
			_obelisk_data.last_update_time
		)
	}

	public fun get_state(ctx: &Context,_obelisk_entity_key: address): vector<u8>  {
        // let _obelisk_schema = borrow_global<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
        let _obelisk_data = table::borrow<address, MultiColumnData>(&_obelisk_schema.value, _obelisk_entity_key);
        _obelisk_data.state
	}

	public fun get_last_update_time(ctx: &Context,_obelisk_entity_key: address): u64  {
        // let _obelisk_schema = borrow_global<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
        let _obelisk_data = table::borrow<address, MultiColumnData>(&_obelisk_schema.value, _obelisk_entity_key);
        _obelisk_data.last_update_time
	}

	public(friend) fun remove(ctx: &mut Context,_obelisk_entity_key: address)  {
        // let _obelisk_schema = borrow_global_mut<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow_mut<SchemaData>(ctx,address);
        let _obelisk_data = table::remove(&mut _obelisk_schema.value, _obelisk_entity_key);
		events::emit_remove(ctx,SCHEMA_ID, _obelisk_entity_key);
		let MultiColumnData { state: _state, last_update_time: _last_update_time } = _obelisk_data;
	}

	public fun contains(ctx: &Context,_obelisk_entity_key: address): bool  {
        // let _obelisk_schema = borrow_global<SchemaData>(world::get_resource_address());
		let address = world::get_resource_address(ctx);
		let _obelisk_schema = account_storage::global_borrow<SchemaData>(ctx,address);
        table::contains<address, MultiColumnData>(&_obelisk_schema.value, _obelisk_entity_key)
	}
}
