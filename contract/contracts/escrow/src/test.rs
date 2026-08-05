#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger, token, Address, Env};

fn create_token<'a>(e: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
    let sac = e.register_stellar_asset_contract_v2(admin.clone());
    let addr = sac.address();
    (addr.clone(), token::StellarAssetClient::new(e, &addr))
}

fn setup<'a>() -> (Env, Address, Address, Address, i128, EscrowContractClient<'a>) {
    let env = Env::default();
    env.mock_all_auths();

    let sender = Address::generate(&env);
    let receiver = Address::generate(&env);
    let admin = Address::generate(&env);

    let (token_addr, token_admin) = create_token(&env, &admin);
    let amount = 500i128;
    token_admin.mint(&sender, &amount);

    let time_lock = env.ledger().timestamp() + 1000;
    let contract_id = env.register(
        EscrowContract,
        (
            sender.clone(),
            receiver.clone(),
            token_addr.clone(),
            amount,
            time_lock,
        ),
    );
    let client = EscrowContractClient::new(&env, &contract_id);

    (env, sender, receiver, token_addr, amount, client)
}

#[test]
fn test_escrow_status_enum_and_placeholders() {
    // Verify the status enum's discriminant ordering is unchanged.
    assert_eq!(Status::Deposit as u32, 0);
    assert_eq!(Status::Locked as u32, 1);
    assert_eq!(Status::Released as u32, 2);
    assert_eq!(Status::Refunded as u32, 3);
}

#[test]
fn deposit_locks_funds() {
    let (env, sender, _receiver, token_addr, amount, client) = setup();
    assert_eq!(client.status(), Status::Deposit);

    let status = client.deposit();
    assert_eq!(status, Status::Locked);
    assert_eq!(client.status(), Status::Locked);

    let token_client = token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&sender), 0);
    assert_eq!(token_client.balance(&client.address), amount);
}

#[test]
fn deposit_then_release_by_sender() {
    let (env, _sender, receiver, token_addr, amount, client) = setup();
    client.deposit();

    let status = client.release();
    assert_eq!(status, Status::Released);
    assert_eq!(client.status(), Status::Released);

    let token_client = token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&receiver), amount);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn release_after_timelock_without_sender_auth() {
    let (env, _sender, receiver, token_addr, amount, client) = setup();
    client.deposit();

    // Fast-forward past the time-lock; release should succeed even though
    // auths are no longer mocked for the sender.
    let time_lock = client.time_lock();
    env.ledger().with_mut(|l| l.timestamp = time_lock);
    env.set_auths(&[]);

    let status = client.release();
    assert_eq!(status, Status::Released);

    let token_client = token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&receiver), amount);
}

#[test]
fn deposit_then_refund() {
    let (env, sender, _receiver, token_addr, amount, client) = setup();
    client.deposit();

    let status = client.refund();
    assert_eq!(status, Status::Refunded);
    assert_eq!(client.status(), Status::Refunded);

    let token_client = token::Client::new(&env, &token_addr);
    assert_eq!(token_client.balance(&sender), amount);
    assert_eq!(token_client.balance(&client.address), 0);
}

#[test]
fn cannot_deposit_twice() {
    let (_env, _sender, _receiver, _token, _amount, client) = setup();
    client.deposit();

    let res = client.try_deposit();
    assert_eq!(res, Err(Ok(Error::AlreadyDeposited)));
}

#[test]
fn cannot_release_before_deposit() {
    let (_env, _sender, _receiver, _token, _amount, client) = setup();
    let res = client.try_release();
    assert_eq!(res, Err(Ok(Error::NotLocked)));
}

#[test]
fn cannot_refund_after_release() {
    let (_env, _sender, _receiver, _token, _amount, client) = setup();
    client.deposit();
    client.release();

    let res = client.try_refund();
    assert_eq!(res, Err(Ok(Error::NotLocked)));
}
