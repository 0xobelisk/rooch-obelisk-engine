module examples::deploy_hook {

    use std::signer::address_of;
    use moveos_std::context::Context;
    use examples::world;

    /// Not the right admin for this world
    const ENotAdmin: u64 = 0;

    public entry fun run(ctx: &mut Context,deployer: &signer) {
        assert!( address_of(deployer) == world::get_creator_address(ctx), ENotAdmin);

        // Logic that needs to be automated once the contract is deployed

    }

    #[test_only]
    public fun deploy_hook_for_testing(ctx: &mut Context,deployer: &signer){
        run(ctx,deployer)
    }
}
