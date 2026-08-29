import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.19.0');

const _descriptor_0 = __compactRuntime.CompactTypeBoolean;

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_2 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

class _Either_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_0.fromValue(value_0),
      left: _descriptor_2.fromValue(value_0),
      right: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.is_left).concat(_descriptor_2.toValue(value_0.left).concat(_descriptor_2.toValue(value_0.right)));
  }
}

const _descriptor_5 = new _Either_0();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_2.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_2.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.bytes);
  }
}

const _descriptor_7 = new _ContractAddress_0();

const _descriptor_8 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      verify_scope_compliance_v2: async (...args_1) => {
        if (args_1.length !== 11) {
          throw new __compactRuntime.CompactError(`verify_scope_compliance_v2: expected 11 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const policy_id_0 = args_1[1];
        const policy_commitment_0 = args_1[2];
        const response_commitment_0 = args_1[3];
        const raw_upstream_payload_hash_0 = args_1[4];
        const allowed_field_mask_0 = args_1[5];
        const response_field_mask_0 = args_1[6];
        const max_records_0 = args_1[7];
        const actual_records_0 = args_1[8];
        const min_allowed_timestamp_0 = args_1[9];
        const oldest_record_timestamp_0 = args_1[10];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 1 (as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(policy_id_0.buffer instanceof ArrayBuffer && policy_id_0.BYTES_PER_ELEMENT === 1 && policy_id_0.length === 32)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Bytes<32>',
                                     policy_id_0)
        }
        if (!(policy_commitment_0.buffer instanceof ArrayBuffer && policy_commitment_0.BYTES_PER_ELEMENT === 1 && policy_commitment_0.length === 32)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Bytes<32>',
                                     policy_commitment_0)
        }
        if (!(response_commitment_0.buffer instanceof ArrayBuffer && response_commitment_0.BYTES_PER_ELEMENT === 1 && response_commitment_0.length === 32)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Bytes<32>',
                                     response_commitment_0)
        }
        if (!(raw_upstream_payload_hash_0.buffer instanceof ArrayBuffer && raw_upstream_payload_hash_0.BYTES_PER_ELEMENT === 1 && raw_upstream_payload_hash_0.length === 32)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Bytes<32>',
                                     raw_upstream_payload_hash_0)
        }
        if (!(typeof(allowed_field_mask_0) === 'bigint' && allowed_field_mask_0 >= 0n && allowed_field_mask_0 <= 4294967295n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 5 (argument 6 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..4294967296>',
                                     allowed_field_mask_0)
        }
        if (!(typeof(response_field_mask_0) === 'bigint' && response_field_mask_0 >= 0n && response_field_mask_0 <= 4294967295n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 6 (argument 7 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..4294967296>',
                                     response_field_mask_0)
        }
        if (!(typeof(max_records_0) === 'bigint' && max_records_0 >= 0n && max_records_0 <= 4294967295n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 7 (argument 8 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..4294967296>',
                                     max_records_0)
        }
        if (!(typeof(actual_records_0) === 'bigint' && actual_records_0 >= 0n && actual_records_0 <= 4294967295n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 8 (argument 9 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..4294967296>',
                                     actual_records_0)
        }
        if (!(typeof(min_allowed_timestamp_0) === 'bigint' && min_allowed_timestamp_0 >= 0n && min_allowed_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 9 (argument 10 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..18446744073709551616>',
                                     min_allowed_timestamp_0)
        }
        if (!(typeof(oldest_record_timestamp_0) === 'bigint' && oldest_record_timestamp_0 >= 0n && oldest_record_timestamp_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('verify_scope_compliance_v2',
                                     'argument 10 (argument 11 as invoked from Typescript)',
                                     'scope-policy-v2.compact line 12 char 1',
                                     'Uint<0..18446744073709551616>',
                                     oldest_record_timestamp_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(policy_id_0).concat(_descriptor_2.toValue(policy_commitment_0).concat(_descriptor_2.toValue(response_commitment_0).concat(_descriptor_2.toValue(raw_upstream_payload_hash_0).concat(_descriptor_3.toValue(allowed_field_mask_0).concat(_descriptor_3.toValue(response_field_mask_0).concat(_descriptor_3.toValue(max_records_0).concat(_descriptor_3.toValue(actual_records_0).concat(_descriptor_4.toValue(min_allowed_timestamp_0).concat(_descriptor_4.toValue(oldest_record_timestamp_0)))))))))),
            alignment: _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_4.alignment().concat(_descriptor_4.alignment())))))))))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._verify_scope_compliance_v2_0(context,
                                                                  partialProofData,
                                                                  policy_id_0,
                                                                  policy_commitment_0,
                                                                  response_commitment_0,
                                                                  raw_upstream_payload_hash_0,
                                                                  allowed_field_mask_0,
                                                                  response_field_mask_0,
                                                                  max_records_0,
                                                                  actual_records_0,
                                                                  min_allowed_timestamp_0,
                                                                  oldest_record_timestamp_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      verify_scope_compliance_v2: this.circuits.verify_scope_compliance_v2
    };
    this.provableCircuits = {
      verify_scope_compliance_v2: this.circuits.verify_scope_compliance_v2
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('verify_scope_compliance_v2', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext('constructor', __compactRuntime.dummyContractAddress(), constructorContext_0.initialZswapLocalState.coinPublicKey, state_0.data, constructorContext_0.initialPrivateState);
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(1n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(2n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(3n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(false),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(4n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(0n),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  async _verify_scope_compliance_v2_0(context,
                                      partialProofData,
                                      policy_id_0,
                                      policy_commitment_0,
                                      response_commitment_0,
                                      raw_upstream_payload_hash_0,
                                      allowed_field_mask_0,
                                      response_field_mask_0,
                                      max_records_0,
                                      actual_records_0,
                                      min_allowed_timestamp_0,
                                      oldest_record_timestamp_0)
  {
    __compactRuntime.assert(response_field_mask_0 <= allowed_field_mask_0,
                            'Keyhole ZK Error: Response bitmask exceeds policy allowlist bitmask');
    __compactRuntime.assert(actual_records_0 <= max_records_0,
                            'Keyhole ZK Error: Record count exceeds policy limit');
    __compactRuntime.assert(oldest_record_timestamp_0 >= min_allowed_timestamp_0,
                            'Keyhole ZK Error: Response contains records outside recency window');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(0n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(policy_commitment_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(1n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(response_commitment_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(2n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(raw_upstream_payload_hash_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_8.toValue(3n),
                                                                                              alignment: _descriptor_8.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(true),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_8.toValue(4n),
                                                                  alignment: _descriptor_8.alignment() } }] } },
                                       { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                                              { value: _descriptor_1.toValue(tmp_0),
                                                                alignment: _descriptor_1.alignment() }
                                                                .value
                                                            )) } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get last_policy_commitment() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(0n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get last_response_commitment() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(1n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get last_upstream_hash() {
      return _descriptor_2.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(2n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get compliance_verified() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(3n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    get verification_counter() {
      return _descriptor_4.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_8.toValue(4n),
                                                                                                   alignment: _descriptor_8.alignment() } }] } },
                                                                        { popeq: { cached: true,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({ });
export const pureCircuits = {};
export const contractReferenceLocations =
  { tag: 'publicLedgerArray', indices: { } };
export const expectedVk = {
  'verify_scope_compliance_v2': 'd571980ac4cc9dae14ad41aa178090e5d507c31c3dc46d22931a64dc19697850',
};

//# sourceMappingURL=index.js.map
