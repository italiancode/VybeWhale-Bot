declare const GetCollectionOwners: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly collectionAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account.";
                };
            };
            readonly required: readonly ["collectionAddress"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly amount: {
                                readonly description: "Amount of NFTs in this collection the address owns";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly owner: {
                                readonly description: "Address of collection owner";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["owner", "amount"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetKnownAccounts: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account";
                };
                readonly name: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Friendly name of account";
                };
                readonly labels: {
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly type: "array";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Category of account. Only accounts matching all labels will be returned (eg. labels=DEFI,NFT)";
                };
                readonly entityName: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Name of the business or entity that controls this account";
                };
                readonly entityId: {
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Entity id to filter with (including as empty or null, such as \"entity_id=\" will filter programs without an entity_id)";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort list ascending. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort by descending. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly accounts: {
                    readonly description: "Found accounts";
                    readonly items: {
                        readonly properties: {
                            readonly dateAdded: {
                                readonly description: "Date added to the database";
                                readonly format: "date-time";
                                readonly type: "string";
                            };
                            readonly entity: {
                                readonly description: "Account entity, if available";
                                readonly type: "string";
                            };
                            readonly entityId: {
                                readonly description: "Account entity ID, if available";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly labels: {
                                readonly description: "Account labels, eg: DEFI,NFT";
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                            readonly logoUrl: {
                                readonly description: "Account logo URL, if available";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Account name";
                                readonly type: "string";
                            };
                            readonly ownerAddress: {
                                readonly description: "The public key (pubKey) associated with the Solana account";
                                readonly type: "string";
                            };
                            readonly twitterUrl: {
                                readonly description: "Twiiter url for the account";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["ownerAddress", "labels", "dateAdded"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["accounts"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetKnownProgramAccounts: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Unique public key for a Solana program";
                };
                readonly name: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Known program name";
                };
                readonly labels: {
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly type: "array";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Labels to filter over. Only programs matching all labels will be returned (eg. labels=DEFI,NFT)";
                };
                readonly entityName: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Name of the business or entity that controls this program";
                };
                readonly entityId: {
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Entity id to filter with (including as empty or null, such as \"entity_id=\" will filter programs without an entity_id)";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort by ascending. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort by descending. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly programs: {
                    readonly description: "List of found programs";
                    readonly items: {
                        readonly properties: {
                            readonly dateAdded: {
                                readonly description: "Date added to the database";
                                readonly format: "date-time";
                                readonly type: "string";
                            };
                            readonly defiLlamaId: {
                                readonly description: "Program DeFi Llama ID";
                                readonly type: "string";
                            };
                            readonly entityId: {
                                readonly description: "Program entity ID";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly entityName: {
                                readonly description: "Name of the business or entity that controls this program";
                                readonly type: "string";
                            };
                            readonly idlUrl: {
                                readonly description: "Program IDL URL";
                                readonly type: "string";
                            };
                            readonly labels: {
                                readonly description: "Program labels, eg: DEFI,NFT";
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                            readonly logoUrl: {
                                readonly description: "Program logo URL";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Program name";
                                readonly type: "string";
                            };
                            readonly programDescription: {
                                readonly description: "Program description";
                                readonly type: "string";
                            };
                            readonly programDetail: {
                                readonly description: "Program detail";
                                readonly type: "string";
                            };
                            readonly programId: {
                                readonly description: "Program ID";
                                readonly type: "string";
                            };
                            readonly siteUrl: {
                                readonly description: "Program site URL";
                                readonly type: "string";
                            };
                            readonly twitterUrl: {
                                readonly description: "Twiiter url for the program account";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["programId", "labels", "dateAdded"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["programs"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetMarketFilteredOhlcv: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly marketId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique identifier assigned to a specific trading pair or market.";
                };
            };
            readonly required: readonly ["marketId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly enum: readonly ["1d", "7d", "30d"];
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w, 1m, 1y, or a string parseable to seconds";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the maximum number of candles to retrieve within a given resolution. Default is 1000.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found OHLCV data";
                    readonly items: {
                        readonly properties: {
                            readonly close: {
                                readonly type: "string";
                            };
                            readonly count: {
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly high: {
                                readonly type: "string";
                            };
                            readonly low: {
                                readonly type: "string";
                            };
                            readonly open: {
                                readonly type: "string";
                            };
                            readonly time: {
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly volume: {
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["time", "open", "high", "low", "close", "volume", "count"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetMarkets: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Unique public key for a Solana program";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Specifies the maximum number of markets to retrieve.";
                };
            };
            readonly required: readonly ["programId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly baseTokenMint: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly baseTokenName: {
                                readonly description: "Name of the base token";
                                readonly type: "string";
                            };
                            readonly baseTokenSymbol: {
                                readonly description: "Ticker for the base token";
                                readonly type: "string";
                            };
                            readonly marketId: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly marketName: {
                                readonly description: "Name of the market";
                                readonly type: "string";
                            };
                            readonly programId: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly programName: {
                                readonly description: "Name of the program";
                                readonly type: "string";
                            };
                            readonly quoteTokenMint: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly quoteTokenName: {
                                readonly description: "Name of the quote token";
                                readonly type: "string";
                            };
                            readonly quoteTokenSymbol: {
                                readonly description: "Ticker for the quote token";
                                readonly type: "string";
                            };
                            readonly updatedAt: {
                                readonly description: "Latest update Time";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["marketId", "programId", "baseTokenMint", "quoteTokenMint", "updatedAt"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPairTradeOhlcvProgram: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly baseMintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
                readonly quoteMintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
            };
            readonly required: readonly ["baseMintAddress", "quoteMintAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly programId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Unique public key for a Solana program";
                };
                readonly resolution: {
                    readonly format: "resolution";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w, 1m, 1y, or a string parseable to seconds";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of candles to return per page. Default is 1000.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found OHLCV data";
                    readonly items: {
                        readonly properties: {
                            readonly close: {
                                readonly description: "Close price";
                                readonly type: "string";
                            };
                            readonly count: {
                                readonly description: "Number of trades";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly high: {
                                readonly description: "High price";
                                readonly type: "string";
                            };
                            readonly low: {
                                readonly description: "Low price";
                                readonly type: "string";
                            };
                            readonly open: {
                                readonly description: "Open price";
                                readonly type: "string";
                            };
                            readonly time: {
                                readonly description: "OHLC time bucket start";
                                readonly type: "string";
                            };
                            readonly volume: {
                                readonly description: "Volume";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["time", "open", "high", "low", "close", "volume", "count"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgram: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly dau: {
                    readonly description: "Unique fee payers in the last day";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly entityName: {
                    readonly description: "Name of the business or entity that controls this program";
                    readonly type: "string";
                };
                readonly friendlyName: {
                    readonly description: "Friendly name";
                    readonly type: "string";
                };
                readonly idlUrl: {
                    readonly description: "Program IDL URL";
                    readonly type: "string";
                };
                readonly instructions1d: {
                    readonly description: "Instruction count in 1 day";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly labels: {
                    readonly description: "Labels to filter over. Only programs matching all labels will be returned (eg. labels=DEFI,NFT)";
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly type: "array";
                };
                readonly logoUrl: {
                    readonly description: "Program logo URL";
                    readonly type: "string";
                };
                readonly name: {
                    readonly description: "Program name";
                    readonly type: "string";
                };
                readonly newUsersChange1d: {
                    readonly description: "1 day change in DAU";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly programDescription: {
                    readonly description: "Program description";
                    readonly type: "string";
                };
                readonly programDetail: {
                    readonly description: "Program detail";
                    readonly type: "string";
                };
                readonly programId: {
                    readonly description: "Program ID";
                    readonly type: "string";
                };
                readonly transactions1d: {
                    readonly description: "Total transactions in 1 day";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
            };
            readonly required: readonly ["programId"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramActiveUsers: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly days: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Number of previous days to include in the data (from today's date).\nAllowed values range from 1 to 30, default to 2 weeks (14 days)";
                };
                readonly limit: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit the number of results. Default is 1000";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort list ascending. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort by descending. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found active users";
                    readonly items: {
                        readonly properties: {
                            readonly instructions: {
                                readonly description: "Amount of instructions triggered by the user";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly programId: {
                                readonly description: "Id of requested program";
                                readonly type: "string";
                            };
                            readonly transactions: {
                                readonly description: "Amount of transactions triggered by the user";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly wallet: {
                                readonly description: "User's wallet id";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["programId", "wallet", "transactions", "instructions"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramActiveUsersCount: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly range: {
                    readonly format: "recent_range";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Range of the data of format '{value}{unit}', which will return the most recent\ninterval with the given unit as the resolution.\nPossible values: '1h' up to '24h' or '1d' up to '30d'";
                };
            };
            readonly required: readonly ["range"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly blockTime: {
                                readonly description: "Block time";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly dau: {
                                readonly description: "Count of unique fee payers in the selected resolution";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly programId: {
                                readonly description: "Unique public key for a Solana program";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["programId", "dau", "blockTime"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramInstructionsCount: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly range: {
                    readonly format: "recent_range";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Range of the data of format '{value}{unit}', which will return the most recent\ninterval with the given unit as the resolution.\nPossible values: '1h' up to '24h' or '1d' up to '30d'";
                };
            };
            readonly required: readonly ["range"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found instructions count";
                    readonly items: {
                        readonly properties: {
                            readonly blockTime: {
                                readonly description: "Block time";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly instructionsCount: {
                                readonly description: "Instructions count";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly programId: {
                                readonly description: "Unique public key for a Solana program";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["programId", "instructionsCount", "blockTime"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramTransactionsCount: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly range: {
                    readonly format: "recent_range";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Range of the data of format '{value}{unit}', which will return the most recent\ninterval with the given unit as the resolution.\nPossible values: '1h' up to '24h' or '1d' up to '30d'";
                };
            };
            readonly required: readonly ["range"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found transactions count";
                    readonly items: {
                        readonly properties: {
                            readonly blockTime: {
                                readonly description: "Block time";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly programId: {
                                readonly description: "Unique public key for a Solana program";
                                readonly type: "string";
                            };
                            readonly transactionsCount: {
                                readonly description: "Transactions count";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["programId", "transactionsCount", "blockTime"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramTvl: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programAddress: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the program of interest";
                };
            };
            readonly required: readonly ["programAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly format: "resolution";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w or a string parseable to seconds";
                };
            };
            readonly required: readonly ["resolution"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found TVLs for program";
                    readonly items: {
                        readonly properties: {
                            readonly time: {
                                readonly description: "time as TIMESTAMPTZ";
                                readonly format: "date-time";
                                readonly type: "string";
                            };
                            readonly tvl: {
                                readonly description: "Programs TVL";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["tvl", "time"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPrograms: {
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly programId: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly programName: {
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["programId"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetProgramsList: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly labels: {
                    readonly items: {
                        readonly type: "string";
                    };
                    readonly type: "array";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Filter programs by labels.. Only accounts matching a label will be returned (eg. labels=DEFI,NFT)\nNote: unlike other endpoints, this endpoint will return programs that match any of the labels, not all of them\nThis is subject to change in the future";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit the number of results for pagination";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending by 'dau', 'name', 'transactions1d' or 'instructions1d'. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort descending by 'dau', 'name', 'transactions1d' or 'instructions1d'. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly dau: {
                                readonly description: "Unique fee payers in the last day";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly entityName: {
                                readonly description: "Name of the business or entity that controls this program";
                                readonly type: "string";
                            };
                            readonly friendlyName: {
                                readonly description: "Friendly name";
                                readonly type: "string";
                            };
                            readonly idlUrl: {
                                readonly description: "Program IDL URL";
                                readonly type: "string";
                            };
                            readonly instructions1d: {
                                readonly description: "Instruction count in 1 day";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly labels: {
                                readonly description: "Labels to filter over. Only programs matching all labels will be returned (eg. labels=DEFI,NFT)";
                                readonly items: {
                                    readonly type: "string";
                                };
                                readonly type: "array";
                            };
                            readonly logoUrl: {
                                readonly description: "Program logo URL";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Program name";
                                readonly type: "string";
                            };
                            readonly newUsersChange1d: {
                                readonly description: "1 day change in DAU";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly programDescription: {
                                readonly description: "Program description";
                                readonly type: "string";
                            };
                            readonly programDetail: {
                                readonly description: "Program detail";
                                readonly type: "string";
                            };
                            readonly programId: {
                                readonly description: "Program ID";
                                readonly type: "string";
                            };
                            readonly transactions1d: {
                                readonly description: "Total transactions in 1 day";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["programId"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPythPrice: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly priceFeedId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key identifying the Pyth price feed account";
                };
            };
            readonly required: readonly ["priceFeedId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly description: "User-facing Pyth price feed update";
            readonly properties: {
                readonly confidence: {
                    readonly description: "Confidence interval of how close we think the true price is to the average.\nIt's influenced by both how sure each person quoting the price is, and how much they agree with each other.";
                    readonly type: "string";
                };
                readonly emac1H: {
                    readonly description: "Exponentially-weighted moving average confidence interval is a time-weighted average of the confidence interval";
                    readonly type: "string";
                };
                readonly emap1H: {
                    readonly description: "Exponentially-weighted moving average price is a time-weighted average of the aggregate price";
                    readonly type: "string";
                };
                readonly lastUpdated: {
                    readonly description: "The last updated time";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly price: {
                    readonly description: "Price of asset expressed in USD";
                    readonly type: "string";
                };
                readonly priceFeedAccount: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly validSlot: {
                    readonly description: "The last valid slot";
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                };
            };
            readonly required: readonly ["priceFeedAccount", "lastUpdated", "validSlot", "price", "confidence", "emac1H", "emap1H"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPythPriceOhlc: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly priceFeedId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key identifying the Pyth price feed account";
                };
            };
            readonly required: readonly ["priceFeedId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly format: "resolution";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w, 1m, 1y, or a string parseable to seconds";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of records to return";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Pagination offset";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly avgConf: {
                                readonly description: "Average confidence";
                                readonly type: "string";
                            };
                            readonly avgPrice: {
                                readonly description: "Average price";
                                readonly type: "string";
                            };
                            readonly close: {
                                readonly description: "Close price";
                                readonly type: "string";
                            };
                            readonly high: {
                                readonly description: "High price";
                                readonly type: "string";
                            };
                            readonly low: {
                                readonly description: "Low price";
                                readonly type: "string";
                            };
                            readonly open: {
                                readonly description: "Open price";
                                readonly type: "string";
                            };
                            readonly timeBucketStart: {
                                readonly description: "Time bucket start";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["timeBucketStart", "open", "high", "low", "close", "avgPrice", "avgConf"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPythPriceProductPairs: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly productId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Pyth product ID to filter over.";
                };
                readonly priceFeedId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Pyth price feed ID to filter over.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly priceFeedId: {
                                readonly description: "The pubkey identifying the Pyth Price feed account.";
                                readonly type: "string";
                            };
                            readonly productId: {
                                readonly description: "The pubkey identifying the Pyth Product account.";
                                readonly type: "string";
                            };
                            readonly symbol: {
                                readonly description: "The Pyth asset symbol";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["productId", "priceFeedId", "symbol"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPythPriceTs: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly priceFeedId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key identifying the Pyth price feed account";
                };
            };
            readonly required: readonly ["priceFeedId"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly format: "resolution";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w, 1m, 1y, or a string parseable to seconds";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of records to return";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Pagination offset";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly description: "User-facing Pyth price feed update";
                        readonly properties: {
                            readonly confidence: {
                                readonly description: "Confidence interval of how close we think the true price is to the average.\nIt's influenced by both how sure each person quoting the price is, and how much they agree with each other.";
                                readonly type: "string";
                            };
                            readonly emac1H: {
                                readonly description: "Exponentially-weighted moving average confidence interval is a time-weighted average of the confidence interval";
                                readonly type: "string";
                            };
                            readonly emap1H: {
                                readonly description: "Exponentially-weighted moving average price is a time-weighted average of the aggregate price";
                                readonly type: "string";
                            };
                            readonly lastUpdated: {
                                readonly description: "The last updated time";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly price: {
                                readonly description: "Price of asset expressed in USD";
                                readonly type: "string";
                            };
                            readonly priceFeedAccount: {
                                readonly format: "pubkey";
                                readonly type: "string";
                            };
                            readonly validSlot: {
                                readonly description: "The last valid slot";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["priceFeedAccount", "lastUpdated", "validSlot", "price", "confidence", "emac1H", "emap1H"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetPythProduct: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly productId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The pubkey identifying the Pyth Product.";
                };
            };
            readonly required: readonly ["productId"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly description: "Structure corresponding to what we will fetch in the API\nThis is saved to a json file";
            readonly oneOf: readonly [{
                readonly required: readonly ["genericSymbol", "schedule"];
                readonly type: "object";
                readonly properties: {
                    readonly genericSymbol: {
                        readonly description: "Ticker symbol";
                        readonly type: "string";
                    };
                    readonly schedule: {
                        readonly description: "Weekly schedule";
                        readonly type: "string";
                    };
                    readonly assetType: {
                        readonly description: "The asset class: Crypto, Equity, FX, Metal, Rates, Commodities";
                        readonly type: "string";
                    };
                    readonly base: {
                        readonly description: "Base asset. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly country: {
                        readonly description: "The country code. Can be present for equity only.";
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly description: "Pair name";
                        readonly type: "string";
                    };
                    readonly productId: {
                        readonly description: "The pubkey identifying the Pyth Product.";
                        readonly type: "string";
                    };
                    readonly quote: {
                        readonly description: "Quote currency. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly symbol: {
                        readonly description: "Pyth asset symbol";
                        readonly type: "string";
                    };
                    readonly tenor: {
                        readonly description: "The tenor. Can be present for FX or equity only.";
                        readonly type: "string";
                    };
                };
            }, {
                readonly required: readonly ["cmsSymbol", "cqsSymbol", "nasdaqSymbol", "schedule"];
                readonly type: "object";
                readonly properties: {
                    readonly cmsSymbol: {
                        readonly description: "CMS market symbol";
                        readonly type: "string";
                    };
                    readonly cqsSymbol: {
                        readonly description: "CQS market symbol";
                        readonly type: "string";
                    };
                    readonly nasdaqSymbol: {
                        readonly description: "Nasdaq market symbol";
                        readonly type: "string";
                    };
                    readonly schedule: {
                        readonly description: "Weekly schedule";
                        readonly type: "string";
                    };
                    readonly assetType: {
                        readonly description: "The asset class: Crypto, Equity, FX, Metal, Rates, Commodities";
                        readonly type: "string";
                    };
                    readonly base: {
                        readonly description: "Base asset. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly country: {
                        readonly description: "The country code. Can be present for equity only.";
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly description: "Pair name";
                        readonly type: "string";
                    };
                    readonly productId: {
                        readonly description: "The pubkey identifying the Pyth Product.";
                        readonly type: "string";
                    };
                    readonly quote: {
                        readonly description: "Quote currency. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly symbol: {
                        readonly description: "Pyth asset symbol";
                        readonly type: "string";
                    };
                    readonly tenor: {
                        readonly description: "The tenor. Can be present for FX or equity only.";
                        readonly type: "string";
                    };
                };
            }, {
                readonly required: readonly ["genericSymbol", "umtf"];
                readonly type: "object";
                readonly properties: {
                    readonly genericSymbol: {
                        readonly description: "Ticker symbol";
                        readonly type: "string";
                    };
                    readonly umtf: {
                        readonly description: "UMTF";
                        readonly type: "string";
                    };
                    readonly assetType: {
                        readonly description: "The asset class: Crypto, Equity, FX, Metal, Rates, Commodities";
                        readonly type: "string";
                    };
                    readonly base: {
                        readonly description: "Base asset. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly country: {
                        readonly description: "The country code. Can be present for equity only.";
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly description: "Pair name";
                        readonly type: "string";
                    };
                    readonly productId: {
                        readonly description: "The pubkey identifying the Pyth Product.";
                        readonly type: "string";
                    };
                    readonly quote: {
                        readonly description: "Quote currency. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly symbol: {
                        readonly description: "Pyth asset symbol";
                        readonly type: "string";
                    };
                    readonly tenor: {
                        readonly description: "The tenor. Can be present for FX or equity only.";
                        readonly type: "string";
                    };
                };
            }, {
                readonly required: readonly ["cmsSymbol", "cqsSymbol", "nasdaqSymbol", "umtf"];
                readonly type: "object";
                readonly properties: {
                    readonly cmsSymbol: {
                        readonly description: "CMS market symbol";
                        readonly type: "string";
                    };
                    readonly cqsSymbol: {
                        readonly description: "CQS market symbol";
                        readonly type: "string";
                    };
                    readonly nasdaqSymbol: {
                        readonly description: "Nasdaq market symbol";
                        readonly type: "string";
                    };
                    readonly umtf: {
                        readonly description: "UMTF";
                        readonly type: "string";
                    };
                    readonly assetType: {
                        readonly description: "The asset class: Crypto, Equity, FX, Metal, Rates, Commodities";
                        readonly type: "string";
                    };
                    readonly base: {
                        readonly description: "Base asset. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly country: {
                        readonly description: "The country code. Can be present for equity only.";
                        readonly type: "string";
                    };
                    readonly description: {
                        readonly description: "Pair name";
                        readonly type: "string";
                    };
                    readonly productId: {
                        readonly description: "The pubkey identifying the Pyth Product.";
                        readonly type: "string";
                    };
                    readonly quote: {
                        readonly description: "Quote currency. Can be present for everything except rates and commodities.";
                        readonly type: "string";
                    };
                    readonly symbol: {
                        readonly description: "Pyth asset symbol";
                        readonly type: "string";
                    };
                    readonly tenor: {
                        readonly description: "The tenor. Can be present for FX or equity only.";
                        readonly type: "string";
                    };
                };
            }];
            readonly required: readonly ["productId", "description", "symbol", "assetType"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenDetails: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
            };
            readonly required: readonly ["mintAddress"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly category: {
                    readonly description: "Category of the token";
                    readonly type: "string";
                };
                readonly currentSupply: {
                    readonly description: "Current token supply";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly decimal: {
                    readonly description: "Decimal places";
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                };
                readonly logoUrl: {
                    readonly description: "Logo associated with the token";
                    readonly type: "string";
                };
                readonly marketCap: {
                    readonly description: "Current token market cap";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly mintAddress: {
                    readonly description: "The public key of the token of interest";
                    readonly type: "string";
                };
                readonly name: {
                    readonly description: "Token mint name";
                    readonly type: "string";
                };
                readonly price: {
                    readonly description: "Current price in USD";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly price1d: {
                    readonly description: "Price in USD of the token 1 day ago";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly price7d: {
                    readonly description: "Price in USD of the token 7 days ago";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly subcategory: {
                    readonly description: "Subcategory of the token";
                    readonly type: "string";
                };
                readonly symbol: {
                    readonly description: "Token mint symbol";
                    readonly type: "string";
                };
                readonly tokenAmountVolume24h: {
                    readonly description: "Token volume transferred in past 24 hours";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly updateTime: {
                    readonly description: "Time of last update of price";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly usdValueVolume24h: {
                    readonly description: "Token volume transferred in past 24 hours USD value";
                    readonly format: "double";
                    readonly type: "number";
                    readonly minimum: -1.7976931348623157e+308;
                    readonly maximum: 1.7976931348623157e+308;
                };
                readonly verified: {
                    readonly description: "Verified status of the token";
                    readonly type: "boolean";
                };
            };
            readonly required: readonly ["symbol", "mintAddress", "price", "price1d", "price7d", "decimal", "verified", "updateTime", "currentSupply", "marketCap"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenHoldersTimeSeries: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
            };
            readonly required: readonly ["mintAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly startTime: {
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of period of interest as a unix timestamp.";
                };
                readonly endTime: {
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of period of interest as a unix timestamp.";
                };
                readonly interval: {
                    readonly description: "Time interval specifier (currently, only \"day\" is supported).";
                    readonly enum: readonly ["day"];
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Result page size specifier.";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Token holders time series data.";
                    readonly items: {
                        readonly properties: {
                            readonly holdersTimestamp: {
                                readonly description: "Unix timestamp of the record.";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly nHolders: {
                                readonly description: "Number of token holders at the instant.";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                        };
                        readonly required: readonly ["holdersTimestamp", "nHolders"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenInstructionNames: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ixName: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Fuzzy search for similar instructions based on your input.";
                };
                readonly callingInstructions: {
                    readonly format: "binary";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Enter the discriminant for a direct instruction name match.";
                };
                readonly callingProgram: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Return all the instructions for this program id";
                };
                readonly programName: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Return all the instructions for this program name";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly callingInstructions: {
                                readonly format: "binary";
                                readonly type: "string";
                            };
                            readonly callingProgram: {
                                readonly type: "string";
                            };
                            readonly ixName: {
                                readonly type: "string";
                            };
                            readonly programName: {
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["callingInstructions", "ixName", "callingProgram", "programName"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenTradeOhlc: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
            };
            readonly required: readonly ["mintAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly enum: readonly ["1d", "7d", "30d"];
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1s, 1m, 3m, 5m, 15m, 30m, 1h, 2h, 3h, 4h, 1d, 1w, 1mo, 1y. Default is \"1d\".";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Result page size specifier. Default is 1000.";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page number for paginated results";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found OHLCV data";
                    readonly items: {
                        readonly properties: {
                            readonly close: {
                                readonly description: "Close price";
                                readonly type: "string";
                            };
                            readonly count: {
                                readonly description: "Number of trades";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly high: {
                                readonly description: "High price";
                                readonly type: "string";
                            };
                            readonly low: {
                                readonly description: "Low price";
                                readonly type: "string";
                            };
                            readonly open: {
                                readonly description: "Open price";
                                readonly type: "string";
                            };
                            readonly time: {
                                readonly description: "OHLC time bucket start";
                                readonly type: "string";
                            };
                            readonly volume: {
                                readonly description: "Volume";
                                readonly type: "string";
                            };
                            readonly volumeUsd: {
                                readonly description: "Volume in USD";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["time", "open", "high", "low", "close", "volume", "volumeUsd", "count"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenTransfers: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
                readonly signature: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Signature of the transaction";
                };
                readonly callingProgram: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the Calling program";
                };
                readonly senderTokenAccount: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sender’s token account";
                };
                readonly senderAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sender’s public key";
                };
                readonly receiverTokenAccount: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Receiver’s token account";
                };
                readonly receiverAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Receiver’s public key";
                };
                readonly feePayer: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Fee payer's public key";
                };
                readonly minAmount: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Lower bound of the amount to filter with";
                };
                readonly maxAmount: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Upper bound of the amount to filter with";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of transfers to return per page. Default/max is 1000.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending by 'amount', 'slot', or 'blockTime'. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort descending by 'amount', 'slot', or 'blockTime'. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly transfers: {
                    readonly description: "Found transfer data";
                    readonly items: {
                        readonly properties: {
                            readonly amount: {
                                readonly description: "The total number of tokens involved in the transaction.";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly blockTime: {
                                readonly description: "The timestamp when the transaction was confirmed on the blockchain, in Unix time.";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly calculatedAmount: {
                                readonly description: "The resulting amount after applying the `decimal` to the `amount` value.";
                                readonly type: "string";
                            };
                            readonly callingMetadata: {
                                readonly description: "The public key of the Solana program that initiated the transaction.";
                                readonly items: {
                                    readonly properties: {
                                        readonly callingInstructions: {
                                            readonly format: "binary";
                                            readonly type: "string";
                                        };
                                        readonly callingProgram: {
                                            readonly type: "string";
                                        };
                                        readonly ixName: {
                                            readonly type: "string";
                                        };
                                        readonly programName: {
                                            readonly type: "string";
                                        };
                                    };
                                    readonly required: readonly ["callingInstructions", "ixName", "callingProgram", "programName"];
                                    readonly type: "object";
                                };
                                readonly type: "array";
                            };
                            readonly decimal: {
                                readonly description: "The number of decimal places used for the token's smallest unit.";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly feePayer: {
                                readonly description: "The public key of the account responsible for paying the transaction fees.";
                                readonly type: "string";
                            };
                            readonly mintAddress: {
                                readonly description: "The public key of the token's mint, specifying the token type involved in the transaction.";
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly description: "Price of the token involved in the transaction (e.g. `mint_address`) expressed in USD.";
                                readonly type: "string";
                            };
                            readonly receiverAddress: {
                                readonly description: "The public key of the account receiving the tokens.";
                                readonly type: "string";
                            };
                            readonly receiverTokenAccount: {
                                readonly description: "The public key of the specific token account of the receiver.";
                                readonly type: "string";
                            };
                            readonly senderAddress: {
                                readonly description: "The public key of the account sending the tokens.";
                                readonly type: "string";
                            };
                            readonly senderTokenAccount: {
                                readonly description: "The public key of the specific token account of the sender.";
                                readonly type: "string";
                            };
                            readonly signature: {
                                readonly description: "The cryptographic signature that uniquely identifies the transaction on the blockchain.";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "The slot number in which the transaction was processed on the Solana blockchain, helping to pinpoint the exact sequence of events.";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly valueUsd: {
                                readonly description: "Calculated total USD value of the transfer based on the `amount`, `decimal`, and `price` values.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["signature", "callingMetadata", "senderAddress", "mintAddress", "feePayer", "decimal", "amount", "slot", "blockTime", "price", "calculatedAmount", "valueUsd"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["transfers"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokenVolumeTimeSeries: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
            };
            readonly required: readonly ["mintAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly startTime: {
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of period of interest as a unix timestamp.";
                };
                readonly endTime: {
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of period of interest as a unix timestamp.";
                };
                readonly interval: {
                    readonly description: "Time interval specifier.";
                    readonly enum: readonly ["hour", "day"];
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Result page size specifier.";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly amount: {
                                readonly description: "Amount transferred of the token.";
                                readonly type: "string";
                            };
                            readonly timeBucketStart: {
                                readonly description: "Time interval start time.";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly volume: {
                                readonly description: "Volume transferred of the token in USD.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["timeBucketStart", "volume", "amount"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTokensSummary: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Optional ascending sort field specification. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Optional descending sort field specification. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Result page size specifier.";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly category: {
                                readonly description: "Category of the token";
                                readonly type: "string";
                            };
                            readonly currentSupply: {
                                readonly description: "Current token supply";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly decimal: {
                                readonly description: "Decimal places";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly logoUrl: {
                                readonly description: "Logo associated with the token";
                                readonly type: "string";
                            };
                            readonly marketCap: {
                                readonly description: "Current token market cap";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly mintAddress: {
                                readonly description: "The public key of the token of interest";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Token mint name";
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly description: "Current price in USD";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly price1d: {
                                readonly description: "Price in USD of the token 1 day ago";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly price7d: {
                                readonly description: "Price in USD of the token 7 days ago";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly subcategory: {
                                readonly description: "Subcategory of the token";
                                readonly type: "string";
                            };
                            readonly symbol: {
                                readonly description: "Token mint symbol";
                                readonly type: "string";
                            };
                            readonly tokenAmountVolume24h: {
                                readonly description: "Token volume transferred in past 24 hours";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly updateTime: {
                                readonly description: "Time of last update of price";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly usdValueVolume24h: {
                                readonly description: "Token volume transferred in past 24 hours USD value";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly verified: {
                                readonly description: "Verified status of the token";
                                readonly type: "boolean";
                            };
                        };
                        readonly required: readonly ["symbol", "mintAddress", "price", "price1d", "price7d", "decimal", "verified", "updateTime", "currentSupply", "marketCap"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTopHolders: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the token of interest";
                };
            };
            readonly required: readonly ["mintAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of transfers to return per page. Default/max is 1000.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending by 'rank', 'ownerName', 'ownerAddress', 'valueUsd', 'balance' or 'percentageOfSupplyHeld'. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort descending by 'rank', 'ownerName', 'ownerAddress', 'valueUsd', 'balance' or 'percentageOfSupplyHeld'. Only one of sort_by_asc or sort_by_desc can be used";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly balance: {
                                readonly description: "Current Token Amount";
                                readonly type: "string";
                            };
                            readonly ownerAddress: {
                                readonly description: "Holder address";
                                readonly type: "string";
                            };
                            readonly ownerLogoUrl: {
                                readonly description: "Holder logo url";
                                readonly type: "string";
                            };
                            readonly ownerName: {
                                readonly description: "Holder name";
                                readonly type: "string";
                            };
                            readonly percentageOfSupplyHeld: {
                                readonly description: "Percentage of supply held";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly rank: {
                                readonly description: "Rank";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly tokenLogoUrl: {
                                readonly description: "Logo Url of the token of interest";
                                readonly type: "string";
                            };
                            readonly tokenMint: {
                                readonly description: "The public key of the token of interest";
                                readonly type: "string";
                            };
                            readonly tokenSymbol: {
                                readonly description: "Symbol of the token of interest";
                                readonly type: "string";
                            };
                            readonly valueUsd: {
                                readonly description: "Value Usd";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["rank", "ownerAddress", "tokenMint", "balance", "valueUsd", "percentageOfSupplyHeld"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetTradeDataProgram: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly programId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The program on which the trade occurred";
                };
                readonly baseMintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the base token";
                };
                readonly quoteMintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the quote token";
                };
                readonly mintAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of either the base or quote token";
                };
                readonly marketId: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Market id to filter with. If provided, the baseMintAddress and quoteMintAddress fields are ignored";
                };
                readonly authorityAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Authority public key to filter with";
                };
                readonly resolution: {
                    readonly format: "resolution";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1h, 1d, 1w, 1m, 1y, or a string parseable to seconds";
                };
                readonly timeStart: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Start time of the data to return (unix timestamp)";
                };
                readonly timeEnd: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "End time of the data to return (unix timestamp)";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Page selection, 0-indexed.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit of the number of trades to return per page. Default/max is 1000.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending by 'price' or 'blocktime'. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort descending by 'price' or 'blocktime'. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly feePayer: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key of the entity that pays for the trade, often used for retrieving trades associated with a specific trading account.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "Found trade data";
                    readonly items: {
                        readonly properties: {
                            readonly authorityAddress: {
                                readonly description: "The public key of the signer who authorized the trade.";
                                readonly type: "string";
                            };
                            readonly baseMintAddress: {
                                readonly description: "The mint address of the base token involved in the trade.";
                                readonly type: "string";
                            };
                            readonly baseSize: {
                                readonly description: "The quantity of the base token involved in the trade.";
                                readonly type: "string";
                            };
                            readonly blockTime: {
                                readonly description: "The Unix timestamp at which the trade occurred on the blockchain.";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly fee: {
                                readonly description: "The amount of fees paid for the trade.";
                                readonly type: "string";
                            };
                            readonly feePayer: {
                                readonly description: "The public key of the account responsible for paying the transaction fees.";
                                readonly type: "string";
                            };
                            readonly iixOrdinal: {
                                readonly description: "The location of the trade inner ix inside the transaction. 255 is returned if not applicable.";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly interIxOrdinal: {
                                readonly description: "The location of the trade inside an ix (in 2 hop swaps). 255 is returned if not applicable.";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly ixOrdinal: {
                                readonly description: "The location of the trade ix inside the transaction.";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly marketId: {
                                readonly description: "The identifier for the market pair, e.g., SOL/USDC, where the trade took place.";
                                readonly type: "string";
                            };
                            readonly price: {
                                readonly description: "The price of one unit of the base token, expressed in terms of the quote token.";
                                readonly type: "string";
                            };
                            readonly programId: {
                                readonly description: "The public key of the AMM or DEX program that facilitated the trade.";
                                readonly type: "string";
                            };
                            readonly quoteMintAddress: {
                                readonly description: "The mint address of the quote token used in the trade.";
                                readonly type: "string";
                            };
                            readonly quoteSize: {
                                readonly description: "The amount of the quote token exchanged in the trade.";
                                readonly type: "string";
                            };
                            readonly signature: {
                                readonly description: "The unique identifier of the transaction signature on the blockchain.";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "Slot of the trade";
                                readonly format: "int64";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 9223372036854776000;
                            };
                            readonly txIndex: {
                                readonly description: "The transaction index of the trade.";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                        };
                        readonly required: readonly ["authorityAddress", "blockTime", "iixOrdinal", "baseMintAddress", "interIxOrdinal", "ixOrdinal", "marketId", "quoteMintAddress", "price", "programId", "signature", "slot", "txIndex", "fee", "feePayer", "baseSize", "quoteSize"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetWalletNfts: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account.";
                };
            };
            readonly required: readonly ["ownerAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly includeNoPriceBalance: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Whether or not we should include NFTs we do not track prices for.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The limit of entries to return. If not passed, first 1000 entries are returned (the maximum).";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The requested page.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "NFTs in the wallet (up to limit)";
                    readonly items: {
                        readonly properties: {
                            readonly collectionAddress: {
                                readonly description: "Public key of the NFT collection";
                                readonly type: "string";
                            };
                            readonly logoUrl: {
                                readonly description: "Logo URL for the NFT";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Symbol for the NFT";
                                readonly type: "string";
                            };
                            readonly priceSol: {
                                readonly description: "Price of the NFT in SOL";
                                readonly type: "string";
                            };
                            readonly priceUsd: {
                                readonly description: "Price of the NFT in USD";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "Slot for the most recent update to the NFT balance";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly totalItems: {
                                readonly description: "Amount of the NFT";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly valueSol: {
                                readonly description: "Value of the held NFT in SOL";
                                readonly type: "string";
                            };
                            readonly valueUsd: {
                                readonly description: "Value of the held NFT in USD";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["collectionAddress", "totalItems", "valueSol", "priceSol", "valueUsd", "priceUsd", "slot"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly date: {
                    readonly description: "Datetime of the report as a Unix timestamp";
                    readonly minimum: 0;
                    readonly type: "integer";
                };
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly totalNftCollectionCount: {
                    readonly description: "Total number of nfts in the wallet";
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                };
                readonly totalSol: {
                    readonly description: "Value of the wallet in SOL";
                    readonly type: "string";
                };
                readonly totalUsd: {
                    readonly description: "Value of the wallet in USD";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["date", "ownerAddress", "totalSol", "totalUsd", "totalNftCollectionCount", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetWalletPnl: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account.";
                };
            };
            readonly required: readonly ["ownerAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly resolution: {
                    readonly enum: readonly ["1d", "7d", "30d"];
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Resolution of the data. Possible values: 1d, 7d, 30d. Default is \"1d\".";
                };
                readonly tokenAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The token address filter for tokens. Provides the token address to filter the requested data by.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending by 'tokenAddress', 'tokenSymbol', 'buysTransactionCount', 'buysTokenAmount', 'buysVolumeUsd', 'sellsTransactionCount', 'sellsTokenAmount', 'sellsVolumeUsd', 'realizedPnlUsd', 'unrealizedPnlUsd'. Only one of sort_by_asc or sort_by_desc can be used.";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort descending by 'tokenAddress', 'tokenSymbol', 'buysTransactionCount', 'buysTokenAmount', 'buysVolumeUsd', 'sellsTransactionCount', 'sellsTokenAmount', 'sellsVolumeUsd', 'realizedPnlUsd', 'unrealizedPnlUsd'. Only one of sort_by_asc or sort_by_desc can be used.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The limit of entries to return. If not passed, first 1000 entries are returned (the maximum).";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The requested page.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly description: "The overall summary and per-token metrics.";
            readonly properties: {
                readonly summary: {
                    readonly description: "Summary of overall trading performance.";
                    readonly properties: {
                        readonly averageTradeUsd: {
                            readonly description: "The average size of trades in USD.";
                            readonly format: "double";
                            readonly type: "number";
                            readonly minimum: -1.7976931348623157e+308;
                            readonly maximum: 1.7976931348623157e+308;
                        };
                        readonly bestPerformingToken: {
                            readonly description: "Summary of a token's performance.";
                            readonly required: readonly ["tokenSymbol", "tokenAddress", "pnlUsd"];
                            readonly type: "object";
                            readonly properties: {
                                readonly pnlUsd: {
                                    readonly description: "The profit or loss for the token in USD.";
                                    readonly format: "double";
                                    readonly type: "number";
                                    readonly minimum: -1.7976931348623157e+308;
                                    readonly maximum: 1.7976931348623157e+308;
                                };
                                readonly tokenAddress: {
                                    readonly description: "The address of token.";
                                    readonly type: "string";
                                };
                                readonly tokenLogoUrl: {
                                    readonly description: "The logo URL of token (if any).";
                                    readonly type: "string";
                                };
                                readonly tokenName: {
                                    readonly description: "The name of token (if any).";
                                    readonly type: "string";
                                };
                                readonly tokenSymbol: {
                                    readonly description: "The symbol of token.";
                                    readonly type: "string";
                                };
                            };
                        };
                        readonly losingTradesCount: {
                            readonly description: "The number of trades that resulted in a loss.";
                            readonly format: "int64";
                            readonly minimum: 0;
                            readonly type: "integer";
                            readonly maximum: 9223372036854776000;
                        };
                        readonly pnlTrendSevenDays: {
                            readonly description: "The profit and loss trend over the last seven days.";
                            readonly items: {
                                readonly items: {
                                    readonly format: "double";
                                    readonly type: "number";
                                    readonly minimum: -1.7976931348623157e+308;
                                    readonly maximum: 1.7976931348623157e+308;
                                };
                                readonly type: "array";
                            };
                            readonly type: "array";
                        };
                        readonly realizedPnlUsd: {
                            readonly description: "The total realized profit in USD.";
                            readonly format: "double";
                            readonly type: "number";
                            readonly minimum: -1.7976931348623157e+308;
                            readonly maximum: 1.7976931348623157e+308;
                        };
                        readonly tradesCount: {
                            readonly description: "The total number of trades executed.";
                            readonly format: "int64";
                            readonly minimum: 0;
                            readonly type: "integer";
                            readonly maximum: 9223372036854776000;
                        };
                        readonly tradesVolumeUsd: {
                            readonly description: "The total trading volume in USD.";
                            readonly format: "double";
                            readonly type: "number";
                            readonly minimum: -1.7976931348623157e+308;
                            readonly maximum: 1.7976931348623157e+308;
                        };
                        readonly uniqueTokensTraded: {
                            readonly description: "The count of unique tokens traded by the account.";
                            readonly format: "int64";
                            readonly minimum: 0;
                            readonly type: "integer";
                            readonly maximum: 9223372036854776000;
                        };
                        readonly unrealizedPnlUsd: {
                            readonly description: "The total unrealized profit in USD.";
                            readonly format: "double";
                            readonly type: "number";
                            readonly minimum: -1.7976931348623157e+308;
                            readonly maximum: 1.7976931348623157e+308;
                        };
                        readonly winRate: {
                            readonly description: "The percentage of winning trades (0.0 to 100.0).";
                            readonly format: "double";
                            readonly type: "number";
                            readonly minimum: -1.7976931348623157e+308;
                            readonly maximum: 1.7976931348623157e+308;
                        };
                        readonly winningTradesCount: {
                            readonly description: "The number of trades that resulted in a profit.";
                            readonly format: "int64";
                            readonly minimum: 0;
                            readonly type: "integer";
                            readonly maximum: 9223372036854776000;
                        };
                        readonly worstPerformingToken: {
                            readonly description: "Summary of a token's performance.";
                            readonly required: readonly ["tokenSymbol", "tokenAddress", "pnlUsd"];
                            readonly type: "object";
                            readonly properties: {
                                readonly pnlUsd: {
                                    readonly description: "The profit or loss for the token in USD.";
                                    readonly format: "double";
                                    readonly type: "number";
                                    readonly minimum: -1.7976931348623157e+308;
                                    readonly maximum: 1.7976931348623157e+308;
                                };
                                readonly tokenAddress: {
                                    readonly description: "The address of token.";
                                    readonly type: "string";
                                };
                                readonly tokenLogoUrl: {
                                    readonly description: "The logo URL of token (if any).";
                                    readonly type: "string";
                                };
                                readonly tokenName: {
                                    readonly description: "The name of token (if any).";
                                    readonly type: "string";
                                };
                                readonly tokenSymbol: {
                                    readonly description: "The symbol of token.";
                                    readonly type: "string";
                                };
                            };
                        };
                    };
                    readonly required: readonly ["winRate", "realizedPnlUsd", "unrealizedPnlUsd", "uniqueTokensTraded", "averageTradeUsd", "tradesCount", "winningTradesCount", "losingTradesCount", "tradesVolumeUsd", "pnlTrendSevenDays"];
                    readonly type: "object";
                };
                readonly tokenMetrics: {
                    readonly description: "Metrics for a token's trading performance.";
                    readonly items: {
                        readonly description: "Metrics for a token's trading performance.";
                        readonly properties: {
                            readonly buys: {
                                readonly description: "Summary metrics for a trade side (buy or sell).";
                                readonly properties: {
                                    readonly tokenAmount: {
                                        readonly description: "The total volume of tokens traded on this side.";
                                        readonly format: "double";
                                        readonly type: "number";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly transactionCount: {
                                        readonly description: "The number of trades executed on this side.";
                                        readonly format: "int64";
                                        readonly minimum: 0;
                                        readonly type: "integer";
                                        readonly maximum: 9223372036854776000;
                                    };
                                    readonly volumeUsd: {
                                        readonly description: "The total traded volume expressed in USD on this side.";
                                        readonly format: "double";
                                        readonly type: "number";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                };
                                readonly required: readonly ["volumeUsd", "tokenAmount", "transactionCount"];
                                readonly type: "object";
                            };
                            readonly realizedPnlUsd: {
                                readonly description: "The total realized profit in USD for this token.";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                            readonly sells: {
                                readonly description: "Summary metrics for a trade side (buy or sell).";
                                readonly properties: {
                                    readonly tokenAmount: {
                                        readonly description: "The total volume of tokens traded on this side.";
                                        readonly format: "double";
                                        readonly type: "number";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                    readonly transactionCount: {
                                        readonly description: "The number of trades executed on this side.";
                                        readonly format: "int64";
                                        readonly minimum: 0;
                                        readonly type: "integer";
                                        readonly maximum: 9223372036854776000;
                                    };
                                    readonly volumeUsd: {
                                        readonly description: "The total traded volume expressed in USD on this side.";
                                        readonly format: "double";
                                        readonly type: "number";
                                        readonly minimum: -1.7976931348623157e+308;
                                        readonly maximum: 1.7976931348623157e+308;
                                    };
                                };
                                readonly required: readonly ["volumeUsd", "tokenAmount", "transactionCount"];
                                readonly type: "object";
                            };
                            readonly tokenAddress: {
                                readonly description: "The address of the token.";
                                readonly type: "string";
                            };
                            readonly tokenSymbol: {
                                readonly description: "The symbol of the token.";
                                readonly type: "string";
                            };
                            readonly unrealizedPnlUsd: {
                                readonly description: "The total unrealized profit in USD for this token.";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                        };
                        readonly required: readonly ["tokenAddress", "tokenSymbol", "realizedPnlUsd", "unrealizedPnlUsd", "buys", "sells"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["summary", "tokenMetrics"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "403": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetWalletTokens: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account.";
                };
            };
            readonly required: readonly ["ownerAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly includeNoPriceBalance: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Whether or not we should include tokens we do not track prices for. Filtering is applied after limiting.";
                };
                readonly sortByAsc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly sortByDesc: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                };
                readonly onlyVerified: {
                    readonly type: "boolean";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Whether tokens returned should be restricted to verified tokens only. Default is false.";
                };
                readonly oneDayTradeMinimum: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The minimum number of trades in the past 24 hours for a token to be considered in the results. Defaults to 100.";
                };
                readonly oneDayTradeVolumeMinimum: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The minimum amount of trade volume (in USD) in the past 24 hours for a token to be considered in the results. Defaults to 100,000.";
                };
                readonly holderMinimum: {
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The minimum number of holders for a token to be considered in the results. Defaults to 50.";
                };
                readonly minAssetValue: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The minimum amount of total value in USD for an asset to be considered in the results. Overrides `includeNoPriceBalance` Defaults to no limit.";
                };
                readonly maxAssetValue: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The maximum amount of total value in USD for an asset to be considered in the results. Overrides `includeNoPriceBalance` Defaults to no limit.";
                };
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The limit of entries to return. If not passed, first 1000 entries are returned (the maximum).";
                };
                readonly page: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The requested page.";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly activeStakedSolBalance: {
                    readonly description: "Value of active staked SOL";
                    readonly type: "string";
                };
                readonly activeStakedSolBalanceUsd: {
                    readonly description: "Value of active staked SOL in USD";
                    readonly type: "string";
                };
                readonly data: {
                    readonly description: "Tokens in the wallet (up to limit)";
                    readonly items: {
                        readonly properties: {
                            readonly amount: {
                                readonly description: "Amount of the token";
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly description: "Category for the token";
                                readonly type: "string";
                            };
                            readonly decimals: {
                                readonly description: "Decimals for the token";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly logoUrl: {
                                readonly description: "Logo URL for the token";
                                readonly type: "string";
                            };
                            readonly mintAddress: {
                                readonly description: "Address for the token";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Name for the token, can be null for unknown addresses";
                                readonly type: "string";
                            };
                            readonly priceUsd: {
                                readonly description: "Average price of the token in USD";
                                readonly type: "string";
                            };
                            readonly priceUsd1dChange: {
                                readonly description: "Change in the price of the token in USD over the last 24 hours";
                                readonly type: "string";
                            };
                            readonly priceUsd7dTrend: {
                                readonly description: "7 day trend of the token price in USD";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "Slot for the most recent update to the token balance. May be 0 if no information is available";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly symbol: {
                                readonly description: "Symbol for the token, can be null for unknown addresses";
                                readonly type: "string";
                            };
                            readonly valueUsd: {
                                readonly description: "Value of the held tokens in USD";
                                readonly type: "string";
                            };
                            readonly valueUsd1dChange: {
                                readonly description: "Change in the value of the held tokens in USD over the last 24 hours";
                                readonly type: "string";
                            };
                            readonly verified: {
                                readonly description: "Whether the token is verified or not.";
                                readonly type: "boolean";
                            };
                        };
                        readonly required: readonly ["mintAddress", "amount", "priceUsd", "priceUsd1dChange", "priceUsd7dTrend", "valueUsd", "valueUsd1dChange", "decimals", "verified", "slot"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly date: {
                    readonly description: "Datetime of the report as a Unix timestamp";
                    readonly minimum: 0;
                    readonly type: "integer";
                };
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly stakedSolBalance: {
                    readonly description: "Value of the staked SOL";
                    readonly type: "string";
                };
                readonly stakedSolBalanceUsd: {
                    readonly description: "Value of the staked SOL in USD";
                    readonly type: "string";
                };
                readonly totalTokenCount: {
                    readonly description: "Total number of tokens in the wallet";
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                };
                readonly totalTokenValueUsd: {
                    readonly description: "Value of the wallet in USD, including SOL";
                    readonly type: "string";
                };
                readonly totalTokenValueUsd1dChange: {
                    readonly description: "Change in the value of the wallet in USD over the last 24 hours";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["date", "ownerAddress", "stakedSolBalanceUsd", "stakedSolBalance", "activeStakedSolBalanceUsd", "activeStakedSolBalance", "totalTokenValueUsd", "totalTokenValueUsd1dChange", "totalTokenCount", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const GetWalletTokensTs: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The public key (pubKey) associated with the Solana account.";
                };
            };
            readonly required: readonly ["ownerAddress"];
        }, {
            readonly type: "object";
            readonly properties: {
                readonly days: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Number of previous days to include in the data (from today's date).\nAllowed values range from 1 to 30, default to 2 weeks (14 days)";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly blockTime: {
                                readonly description: "The timestamp, rounded to the day, of which this account snapshot was taken";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly stakeValue: {
                                readonly description: "The value of staked SOL in USD";
                                readonly type: "string";
                            };
                            readonly stakeValueSol: {
                                readonly description: "The value of staked SOL in SOL";
                                readonly type: "string";
                            };
                            readonly systemValue: {
                                readonly description: "The value of held System SOL in USD";
                                readonly type: "string";
                            };
                            readonly tokenValue: {
                                readonly description: "Combined value of valid SPL tokens in USD";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["blockTime", "tokenValue", "stakeValue", "systemValue", "stakeValueSol"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["ownerAddress", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PostWalletNftsMany: {
    readonly body: {
        readonly properties: {
            readonly includeNoPriceBalance: {
                readonly description: "Whether or not we should include NFTs we do not track prices for.";
                readonly type: "boolean";
            };
            readonly limit: {
                readonly description: "The limit of entries to return (per wallet). If not passed, first 1000 entries are returned (the maximum).";
                readonly format: "int32";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 2147483647;
            };
            readonly page: {
                readonly description: "The requested page.";
                readonly format: "int32";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 2147483647;
            };
            readonly sortByAsc: {
                readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                readonly type: "string";
            };
            readonly sortByDesc: {
                readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                readonly type: "string";
            };
            readonly wallets: {
                readonly description: "Wallets to include in the returned results (max 10).";
                readonly items: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly type: "array";
            };
        };
        readonly required: readonly ["wallets"];
        readonly type: "object";
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "NFTs in the wallet (up to limit)";
                    readonly items: {
                        readonly properties: {
                            readonly collectionAddress: {
                                readonly description: "Public key of the NFT collection";
                                readonly type: "string";
                            };
                            readonly logoUrl: {
                                readonly description: "Logo URL for the NFT";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Symbol for the NFT";
                                readonly type: "string";
                            };
                            readonly priceSol: {
                                readonly description: "Price of the NFT in SOL";
                                readonly type: "string";
                            };
                            readonly priceUsd: {
                                readonly description: "Price of the NFT in USD";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "Slot for the most recent update to the NFT balance";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly totalItems: {
                                readonly description: "Amount of the NFT";
                                readonly format: "int32";
                                readonly type: "integer";
                                readonly minimum: -2147483648;
                                readonly maximum: 2147483647;
                            };
                            readonly valueSol: {
                                readonly description: "Value of the held NFT in SOL";
                                readonly type: "string";
                            };
                            readonly valueUsd: {
                                readonly description: "Value of the held NFT in USD";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["collectionAddress", "totalItems", "valueSol", "priceSol", "valueUsd", "priceUsd", "slot"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly date: {
                    readonly description: "Datetime of the report as a Unix timestamp";
                    readonly minimum: 0;
                    readonly type: "integer";
                };
                readonly ownerAddresses: {
                    readonly description: "Owners of the wallets";
                    readonly items: {
                        readonly format: "pubkey";
                        readonly type: "string";
                    };
                    readonly type: "array";
                };
                readonly totalNftCollectionCount: {
                    readonly description: "Total number of nft collections in the wallet";
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                };
                readonly totalSol: {
                    readonly description: "Value of the wallet in SOL";
                    readonly type: "string";
                };
                readonly totalUsd: {
                    readonly description: "Value of the wallet in USD";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["date", "ownerAddresses", "totalSol", "totalUsd", "totalNftCollectionCount", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PostWalletTokensMany: {
    readonly body: {
        readonly properties: {
            readonly holderMinimum: {
                readonly description: "The minimum number of holders for a token to be considered in the results. Defaults to 50.";
                readonly format: "int64";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 9223372036854776000;
            };
            readonly includeNoPriceBalance: {
                readonly description: "Whether or not we should include tokens we do not track prices for.";
                readonly type: "boolean";
            };
            readonly limit: {
                readonly description: "The limit of entries to return (per wallet). If not passed, first 1000 entries are returned (the maximum).";
                readonly format: "int32";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 2147483647;
            };
            readonly maxAssetValue: {
                readonly description: "The maximum amount of total value in USD for an asset to be considered in the results. Overrides `includeNoPriceBalance` Defaults to no limit.";
                readonly type: "string";
            };
            readonly minAssetValue: {
                readonly description: "The minimum amount of total value in USD for an asset to be considered in the results. Overrides `includeNoPriceBalance` Defaults to no limit.";
                readonly type: "string";
            };
            readonly oneDayTradeMinimum: {
                readonly description: "The minimum number of trades in the past 24 hours for a token to be considered in the results. Defaults to 100.";
                readonly format: "int64";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 9223372036854776000;
            };
            readonly oneDayTradeVolumeMinimum: {
                readonly description: "The minimum amount of trade volume (in USD) in the past 24 hours for a token to be considered in the results. Defaults to 100,000.";
                readonly format: "int64";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 9223372036854776000;
            };
            readonly onlyVerified: {
                readonly description: "Whether tokens returned should be restricted to verified tokens only. Default is false.";
                readonly type: "boolean";
            };
            readonly page: {
                readonly description: "The requested page.";
                readonly format: "int32";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 2147483647;
            };
            readonly sortByAsc: {
                readonly description: "Sort ascending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                readonly type: "string";
            };
            readonly sortByDesc: {
                readonly description: "Sort descending based on amount or value of positions. Only one of sort_by_asc or sort_by_desc can be used";
                readonly type: "string";
            };
            readonly wallets: {
                readonly description: "Wallets to include in the returned results (max 10).";
                readonly items: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly type: "array";
            };
        };
        readonly required: readonly ["wallets"];
        readonly type: "object";
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly activeStakedSolBalance: {
                    readonly description: "Value of active staked SOL";
                    readonly type: "string";
                };
                readonly activeStakedSolBalanceUsd: {
                    readonly description: "Value of active staked SOL in USD";
                    readonly type: "string";
                };
                readonly data: {
                    readonly description: "Tokens in the wallet (up to limit)";
                    readonly items: {
                        readonly properties: {
                            readonly amount: {
                                readonly description: "Amount of the token";
                                readonly type: "string";
                            };
                            readonly category: {
                                readonly description: "Category for the token";
                                readonly type: "string";
                            };
                            readonly decimals: {
                                readonly description: "Decimals for the token";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly logoUrl: {
                                readonly description: "Logo URL for the token";
                                readonly type: "string";
                            };
                            readonly mintAddress: {
                                readonly description: "Address for the token";
                                readonly type: "string";
                            };
                            readonly name: {
                                readonly description: "Name for the token, can be null for unknown addresses";
                                readonly type: "string";
                            };
                            readonly priceUsd: {
                                readonly description: "Average price of the token in USD";
                                readonly type: "string";
                            };
                            readonly priceUsd1dChange: {
                                readonly description: "Change in the price of the token in USD over the last 24 hours";
                                readonly type: "string";
                            };
                            readonly priceUsd7dTrend: {
                                readonly description: "7 day trend of the token price in USD";
                                readonly type: "string";
                            };
                            readonly slot: {
                                readonly description: "Slot for the most recent update to the token balance. May be 0 if no information is available";
                                readonly format: "int64";
                                readonly type: "integer";
                                readonly minimum: -9223372036854776000;
                                readonly maximum: 9223372036854776000;
                            };
                            readonly symbol: {
                                readonly description: "Symbol for the token, can be null for unknown addresses";
                                readonly type: "string";
                            };
                            readonly valueUsd: {
                                readonly description: "Value of the held tokens in USD";
                                readonly type: "string";
                            };
                            readonly valueUsd1dChange: {
                                readonly description: "Change in the value of the held tokens in USD over the last 24 hours";
                                readonly type: "string";
                            };
                            readonly verified: {
                                readonly description: "Whether the token is verified or not.";
                                readonly type: "boolean";
                            };
                        };
                        readonly required: readonly ["mintAddress", "amount", "priceUsd", "priceUsd1dChange", "priceUsd7dTrend", "valueUsd", "valueUsd1dChange", "decimals", "verified", "slot"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly date: {
                    readonly description: "Datetime of the report as a Unix timestamp";
                    readonly minimum: 0;
                    readonly type: "integer";
                };
                readonly ownerAddresses: {
                    readonly description: "Owners of the wallets";
                    readonly items: {
                        readonly format: "pubkey";
                        readonly type: "string";
                    };
                    readonly type: "array";
                };
                readonly stakedSolBalance: {
                    readonly description: "Value of the staked SOL";
                    readonly type: "string";
                };
                readonly stakedSolBalanceUsd: {
                    readonly description: "Value of the staked SOL in USD";
                    readonly type: "string";
                };
                readonly totalTokenCount: {
                    readonly description: "Total number of tokens in the wallet";
                    readonly format: "int64";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 9223372036854776000;
                };
                readonly totalTokenValueUsd: {
                    readonly description: "Value of the wallet in USD, including SOL";
                    readonly type: "string";
                };
                readonly totalTokenValueUsd1dChange: {
                    readonly description: "Change in the value of the tokens in the wallet in USD over the last 24 hours";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["date", "ownerAddresses", "stakedSolBalanceUsd", "stakedSolBalance", "activeStakedSolBalanceUsd", "activeStakedSolBalance", "totalTokenValueUsd", "totalTokenValueUsd1dChange", "totalTokenCount", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const PostWalletTokensTsMany: {
    readonly body: {
        readonly properties: {
            readonly days: {
                readonly description: "Number of previous days to include in the data (from today's date).\nAllowed values range from 1 to 30, default to 2 weeks (14 days)";
                readonly format: "int32";
                readonly minimum: 0;
                readonly type: "integer";
                readonly maximum: 2147483647;
            };
            readonly wallets: {
                readonly description: "Wallets to include in the returned results (max 10).";
                readonly items: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
                readonly type: "array";
            };
        };
        readonly required: readonly ["wallets"];
        readonly type: "object";
        readonly $schema: "http://json-schema.org/draft-04/schema#";
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly items: {
                        readonly properties: {
                            readonly blockTime: {
                                readonly description: "The timestamp, rounded to the day, of which this account snapshot was taken";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly stakeValue: {
                                readonly description: "The value of staked SOL in USD";
                                readonly type: "string";
                            };
                            readonly stakeValueSol: {
                                readonly description: "The value of staked SOL in SOL";
                                readonly type: "string";
                            };
                            readonly systemValue: {
                                readonly description: "The value of held System SOL in USD";
                                readonly type: "string";
                            };
                            readonly tokenValue: {
                                readonly description: "Combined value of valid SPL tokens in USD";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["blockTime", "tokenValue", "stakeValue", "systemValue", "stakeValueSol"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly ownerAddress: {
                    readonly format: "pubkey";
                    readonly type: "string";
                };
            };
            readonly required: readonly ["ownerAddress", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
declare const Ranking: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly limit: {
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Limit the number of programs - default is 10";
                };
                readonly interval: {
                    readonly type: "string";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Interval between the ranks - default is 1 day\nPossible values: '1d', '7d' or '30d'";
                };
                readonly date: {
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The date to return the ranks for in unix timestamp - default is the current date";
                };
            };
            readonly required: readonly [];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly properties: {
                readonly data: {
                    readonly description: "The Ranked programs";
                    readonly items: {
                        readonly properties: {
                            readonly programId: {
                                readonly description: "Program address in base 58 format";
                                readonly type: "string";
                            };
                            readonly programName: {
                                readonly description: "Program Name - null if we dont have it in the dict";
                                readonly type: "string";
                            };
                            readonly programRank: {
                                readonly description: "Program rank for the day";
                                readonly format: "int32";
                                readonly minimum: 0;
                                readonly type: "integer";
                                readonly maximum: 2147483647;
                            };
                            readonly score: {
                                readonly description: "rank score after calculation";
                                readonly format: "double";
                                readonly type: "number";
                                readonly minimum: -1.7976931348623157e+308;
                                readonly maximum: 1.7976931348623157e+308;
                            };
                        };
                        readonly required: readonly ["programRank", "programId", "score"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
                readonly date: {
                    readonly description: "The epoch used to get the ranks for";
                    readonly format: "int64";
                    readonly type: "integer";
                    readonly minimum: -9223372036854776000;
                    readonly maximum: 9223372036854776000;
                };
                readonly interval: {
                    readonly description: "Interval between the ranks - Possible values: '1d', '7d' or '30d'";
                    readonly type: "string";
                };
                readonly limit: {
                    readonly description: "The number of ranks returned";
                    readonly format: "int32";
                    readonly minimum: 0;
                    readonly type: "integer";
                    readonly maximum: 2147483647;
                };
            };
            readonly required: readonly ["date", "interval", "limit", "data"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "400": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "404": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
        readonly "500": {
            readonly properties: {
                readonly code: {
                    readonly description: "Code ID of the error, uniquely identifying the error type";
                    readonly format: "int32";
                    readonly type: "integer";
                    readonly minimum: -2147483648;
                    readonly maximum: 2147483647;
                };
                readonly id: {
                    readonly description: "A unique identifier for the error, representing the error ID in Sentry.\nThis should be submitted as a reference when contacting support.";
                    readonly type: "string";
                };
                readonly message: {
                    readonly description: "A human readable message describing the error that occurred.";
                    readonly type: "string";
                };
                readonly violations: {
                    readonly description: "Optional collection of validation violations representations.";
                    readonly items: {
                        readonly description: "Main structure to represent any kind of validation violation.";
                        readonly properties: {
                            readonly invalidValue: {
                                readonly description: "Provided value which leaded to the violation.";
                                readonly type: "string";
                            };
                            readonly message: {
                                readonly description: "Message to the end user.";
                                readonly type: "string";
                            };
                            readonly propertyPath: {
                                readonly description: "Property path to the field where violation occurred.";
                                readonly type: "string";
                            };
                        };
                        readonly required: readonly ["message"];
                        readonly type: "object";
                    };
                    readonly type: "array";
                };
            };
            readonly required: readonly ["code", "message", "id"];
            readonly type: "object";
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { GetCollectionOwners, GetKnownAccounts, GetKnownProgramAccounts, GetMarketFilteredOhlcv, GetMarkets, GetPairTradeOhlcvProgram, GetProgram, GetProgramActiveUsers, GetProgramActiveUsersCount, GetProgramInstructionsCount, GetProgramTransactionsCount, GetProgramTvl, GetPrograms, GetProgramsList, GetPythPrice, GetPythPriceOhlc, GetPythPriceProductPairs, GetPythPriceTs, GetPythProduct, GetTokenDetails, GetTokenHoldersTimeSeries, GetTokenInstructionNames, GetTokenTradeOhlc, GetTokenTransfers, GetTokenVolumeTimeSeries, GetTokensSummary, GetTopHolders, GetTradeDataProgram, GetWalletNfts, GetWalletPnl, GetWalletTokens, GetWalletTokensTs, PostWalletNftsMany, PostWalletTokensMany, PostWalletTokensTsMany, Ranking };
