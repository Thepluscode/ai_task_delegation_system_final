"""API routes for workflow management."""
from fastapi import APIRouter, HTTPException, Depends, status, Request
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid
import logging

from ai_automation_platform.cloud.workflow_state_management.manager import WorkflowState, WorkflowStateData, WorkflowStateManager
from ai_automation_platform.cloud.api.dependencies import get_workflow_manager

router = APIRouter(prefix="", tags=["workflows"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: Dict[str, Any],
    request: Request,
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """
    Create a new workflow.
    
    Args:
        workflow_data: Dictionary containing workflow data including:
            - metadata: Optional metadata for the workflow
            - dependencies: Optional list of workflow IDs this workflow depends on
            - parent_workflow_id: Optional ID of the parent workflow
    """
    try:
        # Create workflow in the database
        workflow = await workflow_manager.create_workflow(workflow_data)
        
        return {
            "workflow_id": workflow.workflow_id,
            "status": "created",
            "state": workflow.state.name,
            "created_at": workflow.created_at.isoformat(),
            "metadata": workflow.metadata
        }
    except Exception as e:
        logger.error(f"Failed to create workflow: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create workflow: {str(e)}"
        )

@router.get("/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(
    workflow_id: str,
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """
    Get workflow by ID.
    
    Args:
        workflow_id: The ID of the workflow to retrieve
        
    Returns:
        The workflow data if found, or 404 if not found
    """
    try:
        workflow = await workflow_manager.get_workflow_state(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
            
        # Convert the workflow data to a dictionary
        workflow_dict = {
            "workflow_id": workflow.workflow_id,
            "state": workflow.state.name,
            "created_at": workflow.created_at.isoformat(),
            "updated_at": workflow.updated_at.isoformat(),
            "metadata": workflow.metadata,
            "error": workflow.error,
            "dependencies": list(workflow.dependencies),
            "retry_count": workflow.retry_count,
            "max_retries": workflow.max_retries
        }
        
        return workflow_dict
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 404)
        raise
    except Exception as e:
        logger.error(f"Failed to get workflow {workflow_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get workflow: {str(e)}"
        )

@router.put("/{workflow_id}/state", response_model=Dict[str, Any])
async def update_workflow_state(
    workflow_id: str,
    state_update: Dict[str, Any],
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """
    Update workflow state.
    
    Args:
        workflow_id: The ID of the workflow to update
        state_update: Dictionary containing:
            - state: The new state (must be a valid WorkflowState)
            - error: Optional error message
            - metadata: Optional metadata updates
    """
    try:
        # Get workflow state
        workflow = await workflow_manager.get_workflow_state(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Update workflow state
        new_state = state_update.get("state")
        if new_state:
            try:
                workflow = await workflow_manager.update_workflow_state(
                    workflow_id=workflow_id,
                    new_state=WorkflowState[new_state.upper()],
                    error=state_update.get("error"),
                    metadata_updates=state_update.get("metadata")
                )
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
        
        workflow_dict = workflow.to_dict()
        return {
            "workflow_id": workflow_dict["workflow_id"],
            "state": workflow_dict["state"],
            "updated_at": workflow_dict["updated_at"],
            "metadata": workflow_dict["metadata"],
            "error": workflow_dict["error"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update workflow state: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update workflow state: {str(e)}"
        )

@router.post("/{workflow_id}/dependencies", response_model=Dict[str, Any])
async def add_dependency(
    workflow_id: str,
    dependency_data: Dict[str, Any],
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """Add a dependency to a workflow."""
    try:
        # Get workflow state
        workflow = await workflow_manager.get_workflow_state(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        dependency_id = dependency_data.get("workflow_id")
        if not dependency_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing required field: workflow_id"
            )
        
        # Add dependency
        await workflow_manager.add_dependency(workflow_id, dependency_id)
        
        return {
            "workflow_id": workflow_id,
            "dependency_added": dependency_id,
            "dependencies": list(workflow.dependencies),
            "is_child": dependency_data.get("is_child", False)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add dependency: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add dependency: {str(e)}"
        )

@router.get("/{workflow_id}/dependencies/check", response_model=Dict[str, Any])
async def check_dependencies(
    workflow_id: str,
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> Dict[str, Any]:
    """
    Check if all dependencies of a workflow are met.
    
    Args:
        workflow_id: The ID of the workflow to check
    """
    try:
        # Check if workflow exists
        workflow = await workflow_manager.get_workflow_state(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Check dependencies
        all_met, unmet_deps = await workflow_manager.check_dependencies_met(workflow_id)
        
        return {
            "workflow_id": workflow_id,
            "all_dependencies_met": all_met,
            "unmet_dependencies": list(unmet_deps) if unmet_deps else []
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to check dependencies: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check dependencies: {str(e)}"
        )

@router.get("/", response_model=List[Dict[str, Any]])
async def list_workflows(
    state: Optional[str] = None,
    updated_since: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> List[Dict[str, Any]]:
    """
    List workflows with optional filtering.
    
    Args:
        state: Optional state to filter by
        updated_since: Optional ISO 8601 datetime string to filter workflows updated since
        limit: Maximum number of workflows to return (default: 100)
        offset: Number of workflows to skip (for pagination)
    """
    try:
        # Convert state string to enum if provided
        state_enum = None
        if state is not None:
            try:
                state_enum = WorkflowState[state.upper()]
            except KeyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid state: {state}"
                )
        
        # Parse updated_since to datetime if provided
        updated_since_dt = None
        if updated_since is not None:
            try:
                updated_since_dt = datetime.fromisoformat(updated_since.replace('Z', '+00:00'))
                if updated_since_dt.tzinfo is None:
                    updated_since_dt = updated_since_dt.replace(tzinfo=timezone.utc)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid date format. Use ISO 8601 format (e.g., 2023-01-01T00:00:00+00:00)"
                )
        
        # Get filtered workflows
        workflows = await workflow_manager.get_workflows_by_state(
            state=state_enum,
            updated_since=updated_since_dt,
            limit=limit,
            offset=offset
        )
        
        # Convert to list of dicts
        return [
            {
                "workflow_id": w.workflow_id,
                "state": w.state.name,
                "created_at": w.created_at.isoformat(),
                "updated_at": w.updated_at.isoformat(),
                "metadata": w.metadata,
                "error": w.error,
                "dependencies": list(w.dependencies),
                "retry_count": w.retry_count,
                "max_retries": w.max_retries
            }
            for w in workflows
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to list workflows: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list workflows: {str(e)}"
        )

@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    workflow_manager: WorkflowStateManager = Depends(get_workflow_manager)
) -> None:
    """Delete a workflow."""
    try:
        # Check if workflow exists
        workflow = await workflow_manager.get_workflow_state(workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Workflow {workflow_id} not found"
            )
        
        # Delete workflow
        await workflow_manager.delete_workflow(workflow_id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete workflow: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete workflow: {str(e)}"
        )
    
    # In a real application, you might want to add additional checks
    # (e.g., prevent deletion of workflows with active dependencies)
    
    del workflows_db[workflow_id]
    return None
