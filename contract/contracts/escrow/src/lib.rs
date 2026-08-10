#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Env};

/// Status enum representing the escrow lifecycle state machine on Soroban:
/// - `Deposit`: Funds deposited into the contract
/// - `Locked`: Funds locked under release/timelock condition
/// - `Released`: Escrowed funds released to recipient
/// - `Refunded`: Escrowed funds refunded back to depositor
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Status {
    Deposit,
    Locked,
    Released,
    Refunded,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Placeholder function for depositing funds into the escrow contract.
    pub fn deposit(_env: Env) -> Status {
        Status::Deposit
    }

    /// Placeholder function for releasing escrowed funds to the recipient.
    pub fn release(_env: Env) -> Status {
        Status::Released
    }

    /// Placeholder function for refunding escrowed funds back to the depositor.
    pub fn refund(_env: Env) -> Status {
        Status::Refunded
    }
}

mod test;
