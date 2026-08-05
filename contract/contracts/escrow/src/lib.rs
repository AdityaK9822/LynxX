#![no_std]
use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
};

/// Status enum representing the escrow lifecycle state machine
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Status {
    Deposit,
    Locked,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Sender,   // party depositing funds
    Receiver, // party receiving funds on release
    Token,    // SAC address of the escrowed asset
    Amount,   // amount to be escrowed (stroops)
    TimeLock, // timestamp after which release no longer needs the sender's signature
    Status,   // current lifecycle state
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyDeposited = 1, // deposit called outside the Deposit state
    NotLocked = 2,        // release/refund called outside the Locked state
}

/// Emitted when the sender deposits funds into the escrow.
#[contractevent]
#[derive(Clone)]
pub struct Deposited {
    #[topic]
    pub from: Address,
    pub amount: i128,
}

/// Emitted when escrowed funds are released to the receiver.
#[contractevent]
#[derive(Clone)]
pub struct ReleasedEvent {
    #[topic]
    pub to: Address,
    pub amount: i128,
}

/// Emitted when escrowed funds are refunded back to the sender.
#[contractevent]
#[derive(Clone)]
pub struct RefundedEvent {
    #[topic]
    pub to: Address,
    pub amount: i128,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the escrow terms at deploy time.
    pub fn __constructor(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        amount: i128,
        time_lock: u64,
    ) {
        let s = env.storage().instance();
        s.set(&DataKey::Sender, &sender);
        s.set(&DataKey::Receiver, &receiver);
        s.set(&DataKey::Token, &token);
        s.set(&DataKey::Amount, &amount);
        s.set(&DataKey::TimeLock, &time_lock);
        s.set(&DataKey::Status, &Status::Deposit);
    }

    /// Transfer the escrowed amount from the sender into the contract and
    /// move the state to `Locked`. Requires the sender's authorization.
    pub fn deposit(env: Env) -> Result<Status, Error> {
        let s = env.storage().instance();
        let status: Status = s.get(&DataKey::Status).unwrap();
        if status != Status::Deposit {
            return Err(Error::AlreadyDeposited);
        }

        let sender: Address = s.get(&DataKey::Sender).unwrap();
        sender.require_auth();

        let token: Address = s.get(&DataKey::Token).unwrap();
        let amount: i128 = s.get(&DataKey::Amount).unwrap();
        token::Client::new(&env, &token).transfer(&sender, &env.current_contract_address(), &amount);

        s.set(&DataKey::Status, &Status::Locked);

        Deposited {
            from: sender,
            amount,
        }
        .publish(&env);
        Ok(Status::Locked)
    }

    /// Release escrowed funds to the receiver. Before the time-lock expires
    /// this requires the sender's authorization; once it has expired, anyone
    /// may trigger the release.
    pub fn release(env: Env) -> Result<Status, Error> {
        let s = env.storage().instance();
        let status: Status = s.get(&DataKey::Status).unwrap();
        if status != Status::Locked {
            return Err(Error::NotLocked);
        }

        let sender: Address = s.get(&DataKey::Sender).unwrap();
        let time_lock: u64 = s.get(&DataKey::TimeLock).unwrap();
        if env.ledger().timestamp() < time_lock {
            sender.require_auth();
        }

        let receiver: Address = s.get(&DataKey::Receiver).unwrap();
        let token: Address = s.get(&DataKey::Token).unwrap();
        let amount: i128 = s.get(&DataKey::Amount).unwrap();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &receiver,
            &amount,
        );

        s.set(&DataKey::Status, &Status::Released);

        ReleasedEvent {
            to: receiver,
            amount,
        }
        .publish(&env);
        Ok(Status::Released)
    }

    /// Reclaim escrowed funds back to the sender before they have been
    /// released. Requires the sender's authorization.
    pub fn refund(env: Env) -> Result<Status, Error> {
        let s = env.storage().instance();
        let status: Status = s.get(&DataKey::Status).unwrap();
        if status != Status::Locked {
            return Err(Error::NotLocked);
        }

        let sender: Address = s.get(&DataKey::Sender).unwrap();
        sender.require_auth();

        let token: Address = s.get(&DataKey::Token).unwrap();
        let amount: i128 = s.get(&DataKey::Amount).unwrap();
        token::Client::new(&env, &token).transfer(
            &env.current_contract_address(),
            &sender,
            &amount,
        );

        s.set(&DataKey::Status, &Status::Refunded);

        RefundedEvent {
            to: sender,
            amount,
        }
        .publish(&env);
        Ok(Status::Refunded)
    }

    // ── read-only views ──
    pub fn status(env: Env) -> Status {
        env.storage().instance().get(&DataKey::Status).unwrap()
    }
    pub fn sender(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Sender).unwrap()
    }
    pub fn receiver(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Receiver).unwrap()
    }
    pub fn token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).unwrap()
    }
    pub fn amount(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Amount).unwrap()
    }
    pub fn time_lock(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TimeLock).unwrap()
    }
}

mod test;
