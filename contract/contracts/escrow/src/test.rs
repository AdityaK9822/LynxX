#![cfg(test)]

use super::*;
use soroban_sdk::Env;

#[test]
fn test_escrow_status_enum_and_placeholders() {
    let env = Env::default();
    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    // Verify placeholder function execution and return values
    assert_eq!(client.deposit(), Status::Deposit);
    assert_eq!(client.release(), Status::Released);
    assert_eq!(client.refund(), Status::Refunded);
}

#[test]
fn test_status_enum_variants() {
    assert_eq!(Status::Deposit as u32, 0);
    assert_eq!(Status::Locked as u32, 1);
    assert_eq!(Status::Released as u32, 2);
    assert_eq!(Status::Refunded as u32, 3);
}
