module examples::events {
    use std::option::Option;
    use moveos_std::context::Context;
    use moveos_std::event;

    #[event]
    struct SchemaSetRecord<T: drop + store> has drop, store {
        _obelisk_schema_id: vector<u8>,
        _obelisk_schema_type: u8,
        _obelisk_entity_key: Option<address>,
        data: T
    }

    #[event]
    struct SchemaRemoveRecord has drop, store {
        _obelisk_schema_id: vector<u8>,
        _obelisk_entity_key: address
    }

    public fun new_set_record_event<T: drop + store>(_obelisk_schema_id: vector<u8>, _obelisk_schema_type: u8, _obelisk_entity_key: Option<address>, data: T): SchemaSetRecord<T> {
        SchemaSetRecord { _obelisk_schema_id, _obelisk_schema_type, _obelisk_entity_key, data }
    }

    public fun new_remove_record_event(_obelisk_schema_id: vector<u8>, _obelisk_entity_key: address): SchemaRemoveRecord {
        SchemaRemoveRecord { _obelisk_schema_id, _obelisk_entity_key }
    }

    public fun emit_set<T: drop + store>(ctx: &mut Context,_obelisk_schema_id: vector<u8>, _obelisk_schema_type: u8, _obelisk_entity_key: Option<address>, data: T) {
        event::emit(ctx,new_set_record_event<T>(_obelisk_schema_id, _obelisk_schema_type, _obelisk_entity_key, data));
    }

    public fun emit_remove(ctx: &mut Context,_obelisk_schema_id: vector<u8>, _obelisk_entity_key: address) {
        event::emit(ctx,new_remove_record_event(_obelisk_schema_id, _obelisk_entity_key));
    }
}
