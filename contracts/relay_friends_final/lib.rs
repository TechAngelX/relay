#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod relay_friends {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec; // <— REQUIRED for Vec in no_std ink! contracts

    /// A simple friends-list smart contract for Relay.
    #[ink(storage)]
    pub struct RelayFriends {
        friends: Mapping<AccountId, Vec<AccountId>>,
    }

    impl Default for RelayFriends {
        fn default() -> Self {
            Self::new()
        }
    }

    impl RelayFriends {
        /// Create a new instance of the contract.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                friends: Mapping::default(),
            }
        }

        /// Add a friend for the caller.
        #[ink(message)]
        pub fn add_friend(&mut self, friend: AccountId) {
            let caller = self.env().caller();
            let mut list = self.friends.get(&caller).unwrap_or_default();
            if !list.contains(&friend) {
                list.push(friend);
                self.friends.insert(caller, &list);
            }
        }

        /// Remove a friend for the caller.
        #[ink(message)]
        pub fn remove_friend(&mut self, friend: AccountId) {
            let caller = self.env().caller();
            let mut list = self.friends.get(&caller).unwrap_or_default();
            list.retain(|f| f != &friend);
            self.friends.insert(caller, &list);
        }

        /// Get all friends for a given user.
        #[ink(message)]
        pub fn get_friends(&self, user: AccountId) -> Vec<AccountId> {
            self.friends.get(&user).unwrap_or_default()
        }

        /// Check if a friend is already added.
        #[ink(message)]
        pub fn is_friend(&self, user: AccountId, friend: AccountId) -> bool {
            self.friends
                .get(&user)
                .unwrap_or_default()
                .contains(&friend)
        }
    }

    // === Tests ===
    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn add_and_remove_work() {
            let mut contract = RelayFriends::new();
            let friend = AccountId::from([0x42; 32]);

            contract.add_friend(friend);
            assert!(contract.is_friend(contract.env().caller(), friend));

            contract.remove_friend(friend);
            assert!(!contract.is_friend(contract.env().caller(), friend));
        }
    }
}

