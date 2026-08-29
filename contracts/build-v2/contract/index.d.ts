import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  verify_scope_compliance_v2(context: __compactRuntime.CircuitContext<PS>,
                             policy_id_0: Uint8Array,
                             policy_commitment_0: Uint8Array,
                             response_commitment_0: Uint8Array,
                             allowed_field_mask_0: bigint,
                             response_field_mask_0: bigint,
                             is_subset_valid_0: boolean,
                             max_records_0: bigint,
                             actual_records_0: bigint,
                             min_allowed_timestamp_0: bigint,
                             oldest_record_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type ProvableCircuits<PS> = {
  verify_scope_compliance_v2(context: __compactRuntime.CircuitContext<PS>,
                             policy_id_0: Uint8Array,
                             policy_commitment_0: Uint8Array,
                             response_commitment_0: Uint8Array,
                             allowed_field_mask_0: bigint,
                             response_field_mask_0: bigint,
                             is_subset_valid_0: boolean,
                             max_records_0: bigint,
                             actual_records_0: bigint,
                             min_allowed_timestamp_0: bigint,
                             oldest_record_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  verify_scope_compliance_v2(context: __compactRuntime.CircuitContext<PS>,
                             policy_id_0: Uint8Array,
                             policy_commitment_0: Uint8Array,
                             response_commitment_0: Uint8Array,
                             allowed_field_mask_0: bigint,
                             response_field_mask_0: bigint,
                             is_subset_valid_0: boolean,
                             max_records_0: bigint,
                             actual_records_0: bigint,
                             min_allowed_timestamp_0: bigint,
                             oldest_record_timestamp_0: bigint): Promise<__compactRuntime.CircuitResults<PS, []>>;
}

export type Ledger = {
  readonly last_policy_commitment: Uint8Array;
  readonly last_response_commitment: Uint8Array;
  readonly compliance_verified: boolean;
  readonly verification_counter: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;
