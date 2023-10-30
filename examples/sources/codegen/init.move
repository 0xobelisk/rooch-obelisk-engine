module examples::init {
    use examples::world;
    use std::string;
    use moveos_std::context::Context;
    use examples::single_value_schema;
    use examples::single_column_schema;
    use examples::multi_column_schema;
    use examples::single_struct_schema;

    fun initialize(ctx: &mut Context,caller: &signer) {
        world::create(ctx,caller, string::utf8(b"Examples"), string::utf8(b"Examples"));

        // Add Schema
		single_column_schema::register(ctx);
		multi_column_schema::register(ctx);
		single_struct_schema::register(ctx);
        single_value_schema::register(ctx);
    }

    #[test_only]
    public fun init_world_for_test(ctx: &mut Context,caller: &signer){
        initialize(ctx,caller)
    }
}
