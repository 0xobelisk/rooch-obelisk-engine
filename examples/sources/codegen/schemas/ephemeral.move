module examples::ephemeral_schema {
    use examples::events;
    use std::option::none;
	use moveos_std::context::Context;

	const SCHEMA_ID: vector<u8> = b"ephemeral";
    const SCHEMA_TYPE: u8 = 2;

	// value
	struct EphemeralData has drop, store  {
		value: u64
	}

	public fun new(value: u64): EphemeralData {
		EphemeralData {
			value
		}
	}

	public fun emit_ephemeral(ctx: &mut Context, value: u64) {
		events::emit_set(ctx,SCHEMA_ID, SCHEMA_TYPE, none(), new(value))
	}
}
