module examples::example_system {
    use moveos_std::context::Context;
    use examples::single_value_schema;
    #[test_only]
    use std::string;
    #[test_only]
    use examples::init;
    #[test_only]
    use examples::world;
    #[test_only]
    use rooch_framework::account;


    public entry fun increase(ctx: &mut Context,_caller: &signer) {
        let old_number = single_value_schema::get(ctx);
        let new_number = old_number + 10;
        single_value_schema::set(ctx,new_number);
    }

    #[test(sender=@examples)]
    public fun test_create_world(ctx: &mut Context,sender: &signer)  {
        account::create_account_for_test(ctx,@examples);
        init::init_world_for_test(ctx,sender);

        let (name,description,creator) = world::info(ctx);

        assert!(name == string::utf8(b"Examples"), 0);
        assert!(description == string::utf8(b"Examples"), 0);
        assert!(creator == @examples, 0);
    }
}


