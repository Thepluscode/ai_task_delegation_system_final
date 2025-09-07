"""Database models for the workflow state management."""
from datetime import datetime
from typing import Dict, List, Optional, Any
from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey, Table, Enum, Boolean
from sqlalchemy.orm import relationship
import json

# Import Base from the base module to avoid circular imports
from .base import Base

# Use string-based enum to avoid circular imports
WORKFLOW_STATES = [
    'CREATED',
    'PENDING',
    'RUNNING',
    'PAUSED',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
]

# Association table for workflow dependencies
workflow_dependencies = Table(
    'workflow_dependencies',
    Base.metadata,
    Column('workflow_id', String, ForeignKey('workflows.workflow_id'), primary_key=True),
    Column('dependency_id', String, ForeignKey('workflows.workflow_id'), primary_key=True),
    Column('is_child', Boolean, default=False, nullable=False)
)

class WorkflowDB(Base):
    """Database model for workflow state."""
    __tablename__ = "workflows"
    
    workflow_id = Column(String, primary_key=True, index=True)
    state = Column(Enum(*WORKFLOW_STATES, name='workflow_state'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    metadata_ = Column("metadata", JSON, default=dict, nullable=False)
    error = Column(String, nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    parent_workflow_id = Column(String, ForeignKey('workflows.workflow_id'), nullable=True)
    
    # Relationships
    dependencies = relationship(
        'WorkflowDB',
        secondary=workflow_dependencies,
        primaryjoin=workflow_id == workflow_dependencies.c.workflow_id,
        secondaryjoin=workflow_id == workflow_dependencies.c.dependency_id,
        back_populates='dependents',
        overlaps="parent,children,dependents",
        collection_class=set
    )
    
    dependents = relationship(
        'WorkflowDB',
        secondary=workflow_dependencies,
        primaryjoin=workflow_id == workflow_dependencies.c.dependency_id,
        secondaryjoin=workflow_id == workflow_dependencies.c.workflow_id,
        back_populates='dependencies',
        overlaps="parent,children,dependencies",
        collection_class=set
    )
    
    children = relationship(
        'WorkflowDB',
        secondary=workflow_dependencies,
        primaryjoin=(workflow_id == workflow_dependencies.c.workflow_id) & 
                   (workflow_dependencies.c.is_child == True),
        secondaryjoin=workflow_id == workflow_dependencies.c.dependency_id,
        back_populates='parent',
        overlaps="dependencies,dependents,parent",
        collection_class=set
    )
    
    parent = relationship(
        'WorkflowDB',
        secondary=workflow_dependencies,
        primaryjoin=(workflow_id == workflow_dependencies.c.dependency_id) & 
                   (workflow_dependencies.c.is_child == True),
        secondaryjoin=workflow_id == workflow_dependencies.c.workflow_id,
        back_populates='children',
        overlaps="dependencies,dependents,children",
        remote_side=[workflow_id],
        uselist=False
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the model to a dictionary."""
        return {
            "workflow_id": self.workflow_id,
            "state": self.state.name,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata_ or {},
            "error": self.error,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries,
            "dependencies": [dep.workflow_id for dep in self.dependencies],
            "parent_workflow_id": self.parent_workflow_id,
            "child_workflows": [child.workflow_id for child in self.children]
        }
    
    @classmethod
    def from_workflow_data(cls, workflow_data):
        """Create a WorkflowDB instance from WorkflowStateData."""
        return cls(
            workflow_id=workflow_data.workflow_id,
            state=workflow_data.state,
            created_at=workflow_data.created_at,
            updated_at=workflow_data.updated_at,
            metadata_=workflow_data.metadata,
            error=workflow_data.error,
            retry_count=workflow_data.retry_count,
            max_retries=workflow_data.max_retries,
            parent_workflow_id=workflow_data.parent_workflow_id
        )
