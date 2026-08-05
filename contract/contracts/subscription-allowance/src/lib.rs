#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, Address, Env, token,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Allowance {
    pub merchant: Address,
    pub amount: i128,
    pub interval: u64,
    pub last_pull_timestamp: u64,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Allowance(Address, Address),
    Token,
    MinAmount,
    MaxInterval,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum ContractError {
    AllowanceNotFound = 1,
    AllowanceInactive = 2,
    TimeIntervalNotElapsed = 3,
    AmountTooLow = 4,
    IntervalTooLong = 5,
    NotAuthorized = 6,
    TransferFailed = 7,
}

#[contract]
pub struct SubscriptionAllowanceContract;

#[contractimpl]
impl SubscriptionAllowanceContract {
    pub fn __constructor(
        env: Env,
        token: Address,
        min_amount: i128,
        max_interval: u64,
    ) {
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::MinAmount, &min_amount);
        env.storage().instance().set(&DataKey::MaxInterval, &max_interval);
    }

    pub fn set_allowance(
        env: Env,
        user: Address,
        merchant: Address,
        amount: i128,
        interval: u64,
    ) -> Result<Allowance, ContractError> {
        user.require_auth();

        let min_amount: i128 = env.storage().instance().get(&DataKey::MinAmount).unwrap_or(0);
        let max_interval: u64 = env.storage().instance().get(&DataKey::MaxInterval).unwrap_or(2592000);

        if amount < min_amount {
            return Err(ContractError::AmountTooLow);
        }
        if interval > max_interval {
            return Err(ContractError::IntervalTooLong);
        }

        let current_time = env.ledger().timestamp();

        let allowance = Allowance {
            merchant: merchant.clone(),
            amount,
            interval,
            last_pull_timestamp: current_time,
            is_active: true,
        };

        let key = DataKey::Allowance(user.clone(), merchant.clone());
        env.storage().instance().set(&key, &allowance);

        Ok(allowance)
    }

    pub fn execute_pull(
        env: Env,
        merchant: Address,
        user: Address,
    ) -> Result<i128, ContractError> {
        merchant.require_auth();

        let key = DataKey::Allowance(user.clone(), merchant.clone());
        let mut allowance: Allowance = env.storage()
            .instance()
            .get(&key)
            .ok_or(ContractError::AllowanceNotFound)?;

        if !allowance.is_active {
            return Err(ContractError::AllowanceInactive);
        }

        if allowance.merchant != merchant {
            return Err(ContractError::NotAuthorized);
        }

        let current_time = env.ledger().timestamp();

        if current_time < allowance.last_pull_timestamp + allowance.interval {
            return Err(ContractError::TimeIntervalNotElapsed);
        }

        let token_address: Address = env.storage()
            .instance()
            .get(&DataKey::Token)
            .ok_or(ContractError::TransferFailed)?;

        let amount = allowance.amount;

        token::Client::new(&env, &token_address).transfer(&user, &merchant, &amount);

        allowance.last_pull_timestamp = current_time;
        env.storage().instance().set(&key, &allowance);

        Ok(amount)
    }

    pub fn get_allowance(
        env: Env,
        user: Address,
        merchant: Address,
    ) -> Result<Allowance, ContractError> {
        let key = DataKey::Allowance(user, merchant);
        env.storage()
            .instance()
            .get(&key)
            .ok_or(ContractError::AllowanceNotFound)
    }

    pub fn toggle_allowance(
        env: Env,
        user: Address,
        merchant: Address,
    ) -> Result<bool, ContractError> {
        user.require_auth();

        let key = DataKey::Allowance(user.clone(), merchant.clone());
        let mut allowance: Allowance = env.storage()
            .instance()
            .get(&key)
            .ok_or(ContractError::AllowanceNotFound)?;

        allowance.is_active = !allowance.is_active;
        env.storage().instance().set(&key, &allowance);

        Ok(allowance.is_active)
    }

    pub fn get_time_remaining(
        env: Env,
        user: Address,
        merchant: Address,
    ) -> Result<u64, ContractError> {
        let key = DataKey::Allowance(user, merchant);
        let allowance: Allowance = env.storage()
            .instance()
            .get(&key)
            .ok_or(ContractError::AllowanceNotFound)?;

        let current_time = env.ledger().timestamp();
        let next_pull_time = allowance.last_pull_timestamp + allowance.interval;

        if current_time >= next_pull_time {
            Ok(0)
        } else {
            Ok(next_pull_time - current_time)
        }
    }

    pub fn cancel_allowance(
        env: Env,
        user: Address,
        merchant: Address,
    ) -> Result<bool, ContractError> {
        user.require_auth();

        let key = DataKey::Allowance(user, merchant);
        let _allowance: Allowance = env.storage()
            .instance()
            .get(&key)
            .ok_or(ContractError::AllowanceNotFound)?;

        env.storage().instance().remove(&key);

        Ok(true)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, Address, Address, SubscriptionAllowanceContractClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();

        let token = Address::generate(&env);
        let user = Address::generate(&env);
        let merchant = Address::generate(&env);
        let min_amount = 100;
        let max_interval = 2592000;

        let contract_id = env.register(
            SubscriptionAllowanceContract,
            (token.clone(), min_amount, max_interval),
        );
        let client = SubscriptionAllowanceContractClient::new(&env, &contract_id);

        (env, token, user, merchant, client)
    }

    #[test]
    fn test_set_allowance() {
        let (_env, _token, user, merchant, client) = setup();

        let amount = 500;
        let interval = 86400;

        let allowance = client.set_allowance(&user, &merchant, &amount, &interval);
        assert_eq!(allowance.merchant, merchant);
        assert_eq!(allowance.amount, amount);
        assert_eq!(allowance.interval, interval);
        assert!(allowance.is_active);
    }

    #[test]
    #[should_panic(expected = "AmountTooLow")]
    fn test_set_allowance_invalid_amount() {
        let (_env, _token, user, merchant, client) = setup();
        client.set_allowance(&user, &merchant, &50, &86400);
    }

    #[test]
    #[should_panic(expected = "IntervalTooLong")]
    fn test_set_allowance_invalid_interval() {
        let (_env, _token, user, merchant, client) = setup();
        client.set_allowance(&user, &merchant, &500, &5184000);
    }

    #[test]
    fn test_get_allowance() {
        let (_env, _token, user, merchant, client) = setup();

        let amount = 500;
        let interval = 86400;
        client.set_allowance(&user, &merchant, &amount, &interval);

        let allowance = client.get_allowance(&user, &merchant);
        assert_eq!(allowance.merchant, merchant);
        assert_eq!(allowance.amount, amount);
        assert_eq!(allowance.interval, interval);
        assert!(allowance.is_active);
    }

    #[test]
    fn test_toggle_allowance() {
        let (_env, _token, user, merchant, client) = setup();

        let amount = 500;
        let interval = 86400;
        client.set_allowance(&user, &merchant, &amount, &interval);

        let is_active = client.toggle_allowance(&user, &merchant);
        assert!(!is_active);
    }

    #[test]
    fn test_get_time_remaining() {
        let (_env, _token, user, merchant, client) = setup();

        let amount = 500;
        let interval = 2592000;
        client.set_allowance(&user, &merchant, &amount, &interval);

        let remaining = client.get_time_remaining(&user, &merchant);
        assert_eq!(remaining, interval);
    }

    #[test]
    fn test_cancel_allowance() {
        let (_env, _token, user, merchant, client) = setup();

        let amount = 500;
        let interval = 86400;
        client.set_allowance(&user, &merchant, &amount, &interval);

        let result = client.cancel_allowance(&user, &merchant);
        assert!(result);
    }

    #[test]
    #[should_panic(expected = "AllowanceNotFound")]
    fn test_merchant_cannot_pull_without_allowance() {
        let (_env, _token, _user, merchant, client) = setup();
        client.execute_pull(&merchant, &_user);
    }
}
