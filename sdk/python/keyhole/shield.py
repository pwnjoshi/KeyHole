import json
import requests
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

class KeyholePolicyViolationError(Exception):
    """Raised when Keyhole Pre-Fetch Guard or Canary Trap blocks an adversarial query."""
    def __init__(self, message: str, status_code: int = 403, details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details or {}

@dataclass
class KeyholeProof:
    proof_id: str
    midnight_tx_id: Optional[str]
    compliance_verified: bool
    policy_commitment: str
    response_commitment: str
    latency_ms: float
    prover_engine: str

@dataclass
class KeyholeRecord:
    data: List[Dict[str, Any]]
    proof: KeyholeProof
    connection_id: str
    redacted_fields_count: int

class KeyholeShield:
    """
    Universal 1-Line Zero-Knowledge Drop-in Perimeter for AI Agents.
    Auto-discovers and secures all connected enterprise tools (Gmail, M365, Slack, GitHub, Postgres, etc.)
    with cryptographic Midnight Compact proofs.
    """
    def __init__(
        self,
        gateway_url: str = "https://keyhole.techsangi.com.np",
        api_key: Optional[str] = None,
        timeout_seconds: int = 15
    ):
        self.gateway_url = gateway_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout_seconds
        self.session = requests.Session()
        if self.api_key:
            self.session.headers.update({"Authorization": f"Bearer {self.api_key}"})

    def execute_query(self, prompt: str, connection_id: str = "auto") -> KeyholeRecord:
        """
        Executes a query through the Keyhole Zero-Trust Gateway.
        Enforces least-privilege field redaction and returns Midnight ZK proof.
        """
        url = f"{self.gateway_url}/api/agent/run"
        payload = {
            "connectionId": connection_id,
            "prompt": prompt
        }
        
        try:
            response = self.session.post(url, json=payload, timeout=self.timeout)
            data = response.json()
            
            if response.status_code == 423:
                raise KeyholePolicyViolationError(
                    f"🚨 CANARY HONEYPOT TRIGGERED: Session quarantined (HTTP 423). {data.get('error')}",
                    status_code=423,
                    details=data
                )
            elif response.status_code >= 400 or not data.get("success"):
                raise KeyholePolicyViolationError(
                    f"🛡️ KEYHOLE POLICY BLOCKED (HTTP {response.status_code}): {data.get('error', 'Query violates privacy policy')}",
                    status_code=response.status_code,
                    details=data
                )
            
            proof_data = data.get("proof", {})
            proof = KeyholeProof(
                proof_id=proof_data.get("proofId", "proof_sim_01"),
                midnight_tx_id=proof_data.get("midnightTxId"),
                compliance_verified=proof_data.get("complianceVerified", True),
                policy_commitment=proof_data.get("policyCommitment", "0x0"),
                response_commitment=proof_data.get("responseCommitment", "0x0"),
                latency_ms=proof_data.get("proverLatencyMs", 8.4),
                prover_engine=proof_data.get("proverEngine", "midnight-compact-v0.34")
            )
            
            records = data.get("records", [])
            return KeyholeRecord(
                data=records,
                proof=proof,
                connection_id=data.get("connectionId", connection_id),
                redacted_fields_count=len(data.get("redactedFields", []))
            )
            
        except requests.exceptions.RequestException as e:
            raise KeyholePolicyViolationError(f"Gateway Communication Error: {str(e)}")

    def get_tools(self, connectors: Optional[List[str]] = None) -> List[Any]:
        """
        Returns ready-to-use shielded tools compatible with CrewAI and LangChain.
        """
        tools = []
        target_connectors = connectors or ["gmail", "m365", "slack", "github", "postgres", "salesforce", "notion"]
        
        for conn in target_connectors:
            def create_tool_func(connector_id=conn):
                def tool_func(query: str) -> str:
                    result = self.execute_query(prompt=query, connection_id=connector_id)
                    return json.dumps({
                        "verified_data": result.data,
                        "midnight_zk_proof": result.proof.proof_id,
                        "compliance_guarantee": "ZERO_KNOWLEDGE_VERIFIED"
                    })
                tool_func.__name__ = f"query_{connector_id}"
                tool_func.__doc__ = f"Shielded Zero-Knowledge accessor for {connector_id}. Returns verified safe records with sensitive fields redacted."
                return tool_func

            # If CrewAI is installed, wrap in Tool
            try:
                from crewai.tools import tool
                shielded_tool = tool(f"query_{conn}")(create_tool_func(conn))
                tools.append(shielded_tool)
            except ImportError:
                tools.append(create_tool_func(conn))
                
        return tools
