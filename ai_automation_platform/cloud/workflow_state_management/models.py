"""Data models for workflow state management."""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Dict, List, Optional, Set, Any

from .states import WorkflowState

@dataclass
class WorkflowStateData:
    """Data structure for workflow state information."""
    workflow_id: str
    state: WorkflowState
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    dependencies: Set[str] = field(default_factory=set)
    parent_workflow_id: Optional[str] = None
    child_workflows: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to a dictionary for serialization."""
        data = asdict(self)
        data['state'] = self.state.name
        data['created_at'] = self.created_at.isoformat()
        data['updated_at'] = self.updated_at.isoformat()
        data['dependencies'] = list(self.dependencies)
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'WorkflowStateData':
        """Create from a dictionary."""
        data = data.copy()
        data['state'] = WorkflowState[data['state']]
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        data['dependencies'] = set(data.get('dependencies', []))
        return cls(**data)
