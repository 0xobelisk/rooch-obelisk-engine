module examples::world {
    use std::string::String;
    use rooch_framework::account::{SignerCapability,create_signer_with_capability,get_signer_capability_address};
    use rooch_framework::account;
    use std::signer;
    use moveos_std::account_storage;
    use moveos_std::context::Context;

    friend examples::single_value_schema;
    friend examples::single_struct_schema;
    friend examples::single_column_schema;
    friend examples::multi_column_schema;

    const VERSION: u64 = 1;

    /// Schema does not exist
    const ESchemaDoesNotExist: u64 = 0;
    /// Schema already exists
    const ESchemaAlreadyExists: u64 = 1;
    /// Not the right admin for this world
    const ENotAdmin: u64 = 2;
    /// Migration is not an upgrade
    const ENotUpgrade: u64 = 3;
    /// Calling functions from the wrong package version
    const EWrongVersion: u64 = 4;

    struct World has key {
        /// Name of the world
        name: String,
        /// Description of the world
        description: String,
        /// UpdateCap of the world
        update_cap: SignerCapability,
        /// Creator
        creator: address,
        /// Resource address
        resource: address
    }

    public fun create(ctx: &mut Context,creator_signer: &signer, name: String, description: String) {
        let creator = signer::address_of(creator_signer);
        let (_, update_cap) = account::create_resource_account(ctx, creator_signer);
        let resource = account::get_signer_capability_address(&update_cap);
        account_storage::global_move_to(ctx,creator_signer, World { name, description, update_cap, creator, resource})
        // move_to(creator_signer, World { name, description, update_cap, creator, resource});
    }

    public fun get_resource_address(ctx: & Context): address  {
        // let _obelisk_world = borrow_global_mut<World>(@examples);
        let _obelisk_world =account_storage::global_borrow<World>(ctx,@examples);
        get_signer_capability_address(&_obelisk_world.update_cap)
    }

    public fun get_creator_address(ctx: &mut Context): address  {
        // let _obelisk_world = borrow_global_mut<World>(@examples);
        let _obelisk_world =account_storage::global_borrow_mut<World>(ctx,@examples);
        _obelisk_world.creator
    }

    public(friend) fun get_resource_signer(ctx: &mut Context): signer  {
        // let _obelisk_world = borrow_global_mut<World>(@examples);
        let _obelisk_world =account_storage::global_borrow_mut<World>(ctx,@examples);
        create_signer_with_capability(&_obelisk_world.update_cap)
    }

    public fun info(ctx: &mut Context): (String, String, address)  {
        // let _obelisk_world = borrow_global_mut<World>(@examples);
        let _obelisk_world =account_storage::global_borrow_mut<World>(ctx,@examples);
        (_obelisk_world.name, _obelisk_world.description, _obelisk_world.creator)
    }
}
