module EventTicketing::BlockChain_Ticketing_v2 {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_token::token;
    use std::vector;
    use std::option::{Self, Option};
    use aptos_std::bcs;
    

    // Main structs
    //-working
    struct EventTicketingNFT has key {
        token_data_id: token::TokenDataId,
        signer_cap: account::SignerCapability,
    }

    //-working
    struct Event has store, copy {
        event_id: u64,
        name: String,
        description: String,
        date: String,
        venue: String,
        total_seats: u64,
        available_seats: u64,
        base_price: u64,
        creator: address,
        is_active: bool,
        royalty_percentage: u64,
        purchase_limit_per_user: u64,
        purchase_time_window: u64
    }
    //-working
    struct EventStore has key {
        events: vector<Event>,
        event_counter: u64,
    }
    //-working
    struct TicketMetadata has drop, store {
        event_id: u64,
        seat_number: String,
        max_resale_price: u64,
        is_for_sale: bool,
        current_price: u64,
        perks: vector<String>,
        ticket_type: String,
        valid_until: u64
    }
    //-working
    struct TicketListing has key {
        listings: vector<Listing>
    }
    //-working
    struct Listing has store, drop, copy {
        token_id: token::TokenId,
        price: u64,
        seller: address,
        event_id: u64,
        max_resale_price: u64
    }
    //-working

    struct PurchaseHistory has key {
        purchases: vector<Purchase>
    }
    //working
    struct Purchase has store {
        buyer: address,
        event_id: u64,
        purchase_time: u64,
        quantity: u64
    }

    struct ApprovalRegistry has key {
        approved_operators: vector<address>
    }

    // Constants
    //-working
    const COLLECTION_NAME: vector<u8> = b"TicketMarket";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Official event tickets Collection as NFTs";
    const COLLECTION_URI: vector<u8> = b"ipfs://QmYourIPFSCID"; //-just for demo
    const SECONDS_PER_HOUR: u64 = 3600;

    // Error codes
    //-working
    const E_EVENT_STORE_EXISTS: u64 = 1;
    const E_INVALID_SEATS: u64 = 2;
    const E_EVENT_NOT_FOUND: u64 = 3;
    const E_TICKET_NOT_OWNED: u64 = 4;
    const E_TICKET_ALREADY_LISTED: u64 = 5;
    const E_TICKET_NOT_LISTED: u64 = 6;
    const E_INVALID_PRICE: u64 = 7;
    const E_INSUFFICIENT_FUNDS: u64 = 8;
    const E_UNAUTHORIZED: u64 = 9;
    const E_EVENT_INACTIVE: u64 = 10;
    const E_PRICE_EXCEEDS_MAX: u64 = 11;
    const E_PURCHASE_LIMIT_EXCEEDED: u64 = 12;
    const E_INVALID_ROYALTY: u64 = 15;
    const E_TICKET_EXPIRED: u64 = 16;
    const E_TICKET_NOT_FOUND: u64 = 17;
    const E_COLLECTION_NOT_INITIALIZED: u64 = 18;

    // Initialization functions-Anyone can initalize their account in EventStore
    //-working
    public entry fun initialize_organizer(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<EventStore>(account_addr)) {
            move_to(account, EventStore {
                events: vector::empty<Event>(),
                event_counter: 0,
            });
        };

        if (!exists<TicketListing>(account_addr)) {
            move_to(account, TicketListing {
                listings: vector::empty<Listing>()
            });
        };

        if (!exists<PurchaseHistory>(account_addr)) {
            move_to(account, PurchaseHistory {
                purchases: vector::empty<Purchase>()
            });
        };

        if (!exists<ApprovalRegistry>(account_addr)) {
            move_to(account, ApprovalRegistry {
                approved_operators: vector::empty<address>()
            });
        };
    }

    // Function to initialize collection
    //-working
    public entry fun initialize_collection(account: &signer) {
        let account_addr = signer::address_of(account);
        
        if (!exists<EventTicketingNFT>(account_addr)) {
            // Create resource account with a unique seed
            let seed = vector::empty<u8>();
            vector::append(&mut seed, COLLECTION_NAME);
            vector::append(&mut seed, b"_resource_account");
            
            let (resource_signer, resource_cap) = account::create_resource_account(account, seed);
            let resource_signer_addr = signer::address_of(&resource_signer);

            // Initialize collection with mutable settings
            token::create_collection(
                &resource_signer,
                string::utf8(COLLECTION_NAME),
                string::utf8(COLLECTION_DESCRIPTION),
                string::utf8(COLLECTION_URI),
                0,  // No maximum for collection
                vector<bool>[true, true, true]  // Allow mutation, burning, and token property mutation
            );

            move_to(account, EventTicketingNFT {
                token_data_id: token::create_token_data_id(resource_signer_addr, string::utf8(COLLECTION_NAME), string::utf8(b"")),
                signer_cap: resource_cap,
            });
        }
    }

    // Event Management
    //working
    public entry fun create_event(
        account: &signer,
        name: String,
        description: String,
        date: String,
        venue: String,
        total_seats: u64,
        base_price: u64,
        royalty_percentage: u64,
        purchase_limit_per_user: u64,
        purchase_time_window: u64,
        
    ) acquires EventStore {
        assert!(royalty_percentage <= 100, E_INVALID_ROYALTY);
        let account_addr = signer::address_of(account);
        
        if (!exists<EventStore>(account_addr)) {
            initialize_organizer(account);
        };
        
        let event_store = borrow_global_mut<EventStore>(account_addr);
        
        let new_event = Event {
            event_id: event_store.event_counter + 1,
            name,
            description,
            date,
            venue,
            total_seats,
            available_seats: total_seats,
            base_price,
            creator: account_addr,
            is_active: true,
            royalty_percentage,
            purchase_limit_per_user,
            purchase_time_window
        };
        
        vector::push_back(&mut event_store.events, new_event);
        event_store.event_counter = event_store.event_counter + 1;
    }

    // Ticket Minting
    // mint_ticket function-To buy ticket directly for an event
    // working
    public entry fun mint_ticket(
    account: &signer,
    creator: address,
    event_id: u64,
    seat_number: String,
    max_resale_price: u64,
    ticket_type: String,
    perks: vector<String>,
) acquires EventStore, PurchaseHistory, EventTicketingNFT {
    let buyer_addr = signer::address_of(account);
    
    // First get the event details and verify
    let event_store = borrow_global_mut<EventStore>(creator);
    let event = get_event_mut(&mut event_store.events, event_id);
    
    assert!(event.is_active, E_EVENT_INACTIVE);
    assert!(event.available_seats > 0, E_INVALID_SEATS);

    // Get creator's signer capability early
    let nft_data = borrow_global<EventTicketingNFT>(creator);
    let creator_signer = account::create_signer_with_capability(&nft_data.signer_cap);
    let resource_signer_addr = signer::address_of(&creator_signer);

    // Check collection initialization
    assert!(
        token::check_collection_exists(resource_signer_addr, string::utf8(COLLECTION_NAME)),
        E_COLLECTION_NOT_INITIALIZED
    );

    // Handle payment
    let price = event.base_price;
    if (price > 0) {
        assert!(coin::balance<AptosCoin>(buyer_addr) >= price, E_INSUFFICIENT_FUNDS);
        coin::transfer<AptosCoin>(account, creator, price);
    };

    // Update event seats
    event.available_seats = event.available_seats - 1;

    // Record purchase
    let purchase_history = borrow_global_mut<PurchaseHistory>(creator);
    let purchase = Purchase {
        buyer: buyer_addr,
        event_id,
        purchase_time: timestamp::now_seconds(),
        quantity: 1
    };
    vector::push_back(&mut purchase_history.purchases, purchase);

    // Generate token data
    let token_name = string::utf8(b"Ticket-");
    string::append(&mut token_name, event.name);
    string::append(&mut token_name, string::utf8(b"-"));
    string::append(&mut token_name, seat_number);
    
    let token_description = string::utf8(b"Official event ticket for ");
    string::append(&mut token_description, event.name);
    
    let token_uri = string::utf8(b"https://eventnft.example.com/ticket/");
    string::append(&mut token_uri, seat_number);

    let metadata = TicketMetadata {
        event_id,
        seat_number,
        max_resale_price,
        is_for_sale: false,
        current_price: event.base_price,
        perks,
        ticket_type,
        valid_until: timestamp::now_seconds() + (365 * 24 * 60 * 60)
    };

    let metadata_bytes = bcs::to_bytes(&metadata);
    let metadata_keys = vector<String>[string::utf8(b"metadata")];
    let metadata_values = vector<vector<u8>>[metadata_bytes];
    let metadata_types = vector<String>[string::utf8(b"object")];

    token::create_token_script(
        &creator_signer,
        string::utf8(COLLECTION_NAME),
        token_name,
        token_description,
        1,
        0,
        token_uri,
        resource_signer_addr,  // Changed from creator to resource_signer_addr
        1000,
        10,
        vector<bool>[false, false, false, false, false],
        metadata_keys,
        metadata_values,
        metadata_types
    );

    // Transfer token to buyer
    let token_id = token::create_token_id_raw(
        resource_signer_addr,  // Changed from creator to resource_signer_addr
        string::utf8(COLLECTION_NAME),
        token_name,
        0
    );
    
    token::opt_in_direct_transfer(account, true);
    token::transfer(&creator_signer, token_id, buyer_addr, 1);
}

    // Secondary Market
// Add these new error codes at the top of your contract
const E_NOT_INITIALIZED: u64 = 19;
const E_TOKEN_VERIFICATION_FAILED: u64 = 20;
const E_EVENT_STORE_NOT_FOUND: u64 = 21;
const E_LISTING_STORE_NOT_FOUND: u64 = 22;


    // Secondary Market
    //working
    // Modify the list_for_sale function in BlockChain_Ticketing
public entry fun list_for_sale(
    account: &signer,
    creator: address,
    collection_name: String,
    token_name: String,
    property_version: u64,
    price: u64,
    event_id: u64,
    max_resale_price: u64
) acquires TicketListing, EventTicketingNFT {
    let seller_addr = signer::address_of(account);
    
    // Get the resource account address from EventTicketingNFT
    let nft_data = borrow_global<EventTicketingNFT>(creator);
    let resource_signer = account::create_signer_with_capability(&nft_data.signer_cap);
    let resource_addr = signer::address_of(&resource_signer);
    
    // Create token_id using resource account address instead of creator
    let token_id = token::create_token_id_raw(
        resource_addr,  // Use resource account address
        collection_name,
        token_name,
        property_version
    );

    assert!(price <= max_resale_price, E_PRICE_EXCEEDS_MAX);

    let listings_store = borrow_global_mut<TicketListing>(creator);
    
    let i = 0;
    let len = vector::length(&listings_store.listings);
    while (i < len) {
        let listing = vector::borrow(&listings_store.listings, i);
        assert!(listing.token_id != token_id, E_TICKET_ALREADY_LISTED);
        i = i + 1;
    };

    let new_listing = Listing {
        token_id,
        price,
        seller: seller_addr,
        event_id,
        max_resale_price
    };

    vector::push_back(&mut listings_store.listings, new_listing);
}
    // Purchase with Royalties
public entry fun buy_ticket(
    buyer: &signer,
    creator: address,
    collection_name: String,
    token_name: String,
    property_version: u64
) acquires TicketListing, EventStore, EventTicketingNFT {
    let buyer_addr = signer::address_of(buyer);
    
    // Get the resource account address from EventTicketingNFT
    let nft_data = borrow_global<EventTicketingNFT>(creator);
    let resource_signer = account::create_signer_with_capability(&nft_data.signer_cap);
    let resource_addr = signer::address_of(&resource_signer);
    
    // Create token_id using resource account address
    let token_id = token::create_token_id_raw(
        resource_addr,
        collection_name,
        token_name,
        property_version
    );

    // Get listing details
    let listings_store = borrow_global_mut<TicketListing>(creator);
    let (exists, index) = find_listing(&listings_store.listings, token_id);
    assert!(exists, E_TICKET_NOT_LISTED);
    
    let listing = vector::borrow(&listings_store.listings, index);
    let seller = listing.seller;
    let price = listing.price;
    let event_id = listing.event_id;
    
    // Verify buyer has sufficient funds
    assert!(coin::balance<AptosCoin>(buyer_addr) >=0, E_INSUFFICIENT_FUNDS);
    
    // Get event details for royalty calculation
    let event_store = borrow_global<EventStore>(creator);
    let event = get_event(&event_store.events, event_id);
    
    // Calculate royalty
    let royalty_amount = (price * event.royalty_percentage) / 100;
    let seller_amount = price - royalty_amount;
    
    // Transfer payment with royalty
    if (royalty_amount > 0) {
        coin::transfer<AptosCoin>(buyer, creator, royalty_amount);
    };
    if (seller_amount > 0) {
        coin::transfer<AptosCoin>(buyer, seller, seller_amount);
    };
    
    // Transfer token to buyer
    token::opt_in_direct_transfer(buyer, true);
    token::transfer(buyer, token_id, buyer_addr, 1);
    
    // Remove listing
    vector::remove(&mut listings_store.listings, index);
}

    // Anti-Bot Protection
    fun check_purchase_limits(
        buyer: address,
        creator: address,
        event_id: u64
    ) acquires EventStore, PurchaseHistory {
        let event_store = borrow_global<EventStore>(creator);
        let event = get_event(&event_store.events, event_id);
        
        if (exists<PurchaseHistory>(creator)) {
            let purchase_history = borrow_global<PurchaseHistory>(creator);
            let current_time = timestamp::now_seconds();
            let total_purchases = 0;
            
            let i = 0;
            let len = vector::length(&purchase_history.purchases);
            while (i < len) {
                let purchase = vector::borrow(&purchase_history.purchases, i);
                if (purchase.buyer == buyer && 
                    purchase.event_id == event_id &&
                    current_time - purchase.purchase_time <= event.purchase_time_window) {
                    total_purchases = total_purchases + purchase.quantity;
                };
                i = i + 1;
            };
            
            assert!(total_purchases < event.purchase_limit_per_user, E_PURCHASE_LIMIT_EXCEEDED);
        };
    }

    // Approval System
    public entry fun approve_operator(
        account: &signer,
        operator: address
    ) acquires ApprovalRegistry {
        let owner = signer::address_of(account);
        let registry = borrow_global_mut<ApprovalRegistry>(owner);
        vector::push_back(&mut registry.approved_operators, operator);
    }


    // Approval System (continued)
    public entry fun revoke_operator(
        account: &signer,
        operator: address
    ) acquires ApprovalRegistry {
        let owner = signer::address_of(account);
        let registry = borrow_global_mut<ApprovalRegistry>(owner);
        let (exists, index) = vector::index_of(&registry.approved_operators, &operator);
        if (exists) {
            vector::remove(&mut registry.approved_operators, index);
        };
    }

    // Utility functions
    fun get_event_mut(events: &mut vector<Event>, event_id: u64): &mut Event {
        let i = 0;
        let len = vector::length(events);
        while (i < len) {
            let event = vector::borrow_mut(events, i);
            if (event.event_id == event_id) {
                return event
            };
            i = i + 1;
        };
        abort E_EVENT_NOT_FOUND
    }

    fun get_event(events: &vector<Event>, event_id: u64): &Event {
        let i = 0;
        let len = vector::length(events);
        while (i < len) {
            let event = vector::borrow(events, i);
            if (event.event_id == event_id) {
                return event
            };
            i = i + 1;
        };
        abort E_EVENT_NOT_FOUND
    }

    fun find_listing(listings: &vector<Listing>, token_id: token::TokenId): (bool, u64) {
        let i = 0;
        let len = vector::length(listings);
        while (i < len) {
            let listing = vector::borrow(listings, i);
            if (listing.token_id == token_id) {
                return (true, i)
            };
            i = i + 1;
        };
        (false, 0)
    }

    // View Functions
    //-working
    #[view]
    public fun get_event_details(creator: address, event_id: u64): Option<Event> acquires EventStore {
        if (!exists<EventStore>(creator)) {
            return option::none()
        };
        
        let event_store = borrow_global<EventStore>(creator);
        let i = 0;
        let len = vector::length(&event_store.events);
        
        while (i < len) {
            let event = vector::borrow(&event_store.events, i);
            if (event.event_id == event_id) {
                return option::some(*event)
            };
            i = i + 1;
        };
        
        option::none()
    }

    #[view]
    //-matching
    public fun get_active_listings(creator: address): vector<Listing> acquires TicketListing {
        if (!exists<TicketListing>(creator)) {
            return vector::empty()
        };
        
        *&borrow_global<TicketListing>(creator).listings
    }

    // Function to view tickets owned by a user
    #[view]
    public fun get_purchase_history_by_address(user_address: address): vector<Purchase> acquires PurchaseHistory {
        let purchase_history = vector::empty<Purchase>();
        let deployer: address = @0x46471c5f47f8a55bbd930a11f7796b18140a40540773388fafd42da916301697;
        // Check if the PurchaseHistory exists for the user address
            let history = borrow_global<PurchaseHistory>(deployer);
            let i = 0;
            let len = vector::length(&history.purchases);

            // Iterate through the purchases and filter by user address
            while (i < len) {
                let purchase = vector::borrow(&history.purchases, i);
                if (purchase.buyer == user_address) {
                    // Create a new Purchase instance and copy the fields
                    let new_purchase = Purchase {
                        buyer: purchase.buyer,
                        event_id: purchase.event_id,
                        purchase_time: purchase.purchase_time,
                        quantity: purchase.quantity,
                    };
                    // Add the new purchase to the result vector
                    vector::push_back(&mut purchase_history, new_purchase);
                };
                i = i + 1;
            };
        

        purchase_history
    }
}

