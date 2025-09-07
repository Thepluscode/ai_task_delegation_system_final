"""Test script for the AI Automation Platform API."""
import os
import sys
import asyncio
import aiohttp
import json
from datetime import datetime, timezone

# API configuration
BASE_URL = "http://localhost:8001/api/v1"

# Test token (you'll need to set this manually or get it from your auth system)
# For testing purposes, you might want to temporarily disable auth in the API
TEST_TOKEN = "test-token-123"  # Replace with a valid token if needed

async def test_create_workflow(session):
    """Test creating a new workflow."""
    url = f"{BASE_URL}/workflows/"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}"
    }
    
    workflow_data = {
        "metadata": {
            "name": "Test Workflow",
            "description": "A test workflow created by the test script",
            "priority": "high"
        },
        "dependencies": [],
        "parent_workflow_id": None
    }
    
    try:
        async with session.post(url, headers=headers, json=workflow_data) as response:
            if response.status == 201:
                data = await response.json()
                print("✅ Workflow created successfully!")
                print(json.dumps(data, indent=2))
                return data["workflow_id"]
            else:
                print(f"❌ Failed to create workflow: {response.status}")
                error = await response.text()
                print(f"Error: {error}")
                return None
    except Exception as e:
        print(f"❌ Exception while creating workflow: {str(e)}")
        return None

async def test_get_workflow(session, workflow_id):
    """Test retrieving a workflow by ID."""
    if not workflow_id:
        print("❌ No workflow ID provided")
        return None
        
    url = f"{BASE_URL}/workflows/{workflow_id}"
    headers = {
        "Authorization": f"Bearer {TEST_TOKEN}",
        "Content-Type": "application/json"
    }
    
    max_retries = 3
    retry_delay = 1  # seconds
    
    for attempt in range(max_retries):
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Retrieved workflow {workflow_id}:")
                    print(json.dumps(data, indent=2))
                    return data
                elif response.status == 404 and attempt < max_retries - 1:
                    # Workflow not found, try creating it
                    print(f"⚠️ Workflow not found, creating test workflow (attempt {attempt + 1}/{max_retries})...")
                    workflow_data = await test_create_workflow(session)
                    if workflow_data and 'workflow_id' in workflow_data:
                        workflow_id = workflow_data['workflow_id']
                        await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                        continue
                
                # If we get here, we either got a non-404 error or ran out of retries
                print(f"❌ Failed to get workflow {workflow_id}: {response.status}")
                error = await response.text()
                print(f"Error: {error}")
                return None
                
        except Exception as e:
            if attempt == max_retries - 1:  # Last attempt
                print(f"❌ Exception while getting workflow after {max_retries} attempts: {str(e)}")
                return None
            await asyncio.sleep(retry_delay * (attempt + 1))  # Exponential backoff
    
    return None

async def test_update_workflow_state(session, workflow_id):
    """Test updating a workflow's state."""
    if not workflow_id:
        print("❌ No workflow ID provided")
        return
        
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TEST_TOKEN}"
    }
    
    # First transition: CREATED -> PENDING
    url = f"{BASE_URL}/workflows/{workflow_id}/state"
    state_update = {
        "state": "PENDING",
        "metadata": {
            "transitioned_at": datetime.now(timezone.utc).isoformat(),
            "reason": "Starting workflow execution"
        }
    }
    
    try:
        async with session.put(url, headers=headers, json=state_update) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Updated workflow {workflow_id} state to PENDING:")
                print(json.dumps(data, indent=2))
                
                # Second transition: PENDING -> RUNNING
                state_update = {
                    "state": "RUNNING",
                    "metadata": {
                        "started_at": datetime.now(timezone.utc).isoformat(),
                        "progress": 0.1
                    }
                }
                
                async with session.put(url, headers=headers, json=state_update) as run_response:
                    if run_response.status == 200:
                        run_data = await run_response.json()
                        print(f"✅ Updated workflow {workflow_id} state to RUNNING:")
                        print(json.dumps(run_data, indent=2))
                        return run_data
                    else:
                        print(f"❌ Failed to update workflow {workflow_id} state to RUNNING: {run_response.status}")
                        error = await run_response.text()
                        print(f"Error: {error}")
                        return None
            else:
                print(f"❌ Failed to update workflow {workflow_id} state to PENDING: {response.status}")
                error = await response.text()
                print(f"Error: {error}")
                return None
    except Exception as e:
        print(f"❌ Exception while updating workflow state: {str(e)}")
        return None
    
    try:
        async with session.put(url, headers=headers, json=state_update) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Updated workflow {workflow_id} state to RUNNING:")
                print(json.dumps(data, indent=2))
                return data
            else:
                print(f"❌ Failed to update workflow {workflow_id} state: {response.status}")
                error = await response.text()
                print(f"Error: {error}")
                return None
    except Exception as e:
        print(f"❌ Exception while updating workflow state: {str(e)}")
        return None

async def test_list_workflows(session):
    """Test listing workflows."""
    url = f"{BASE_URL}/workflows/"
    headers = {
        "Authorization": f"Bearer {TEST_TOKEN}"
    }
    
    try:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                print(f"✅ Retrieved {len(data)} workflows:")
                print(json.dumps(data, indent=2))
                return data
            else:
                print(f"❌ Failed to list workflows: {response.status}")
                error = await response.text()
                print(f"Error: {error}")
                return []
    except Exception as e:
        print(f"❌ Exception while listing workflows: {str(e)}")
        return []

async def run_tests():
    """Run all API tests."""
    async with aiohttp.ClientSession() as session:
        print("\n=== Starting API Tests ===\n")
        
        # Test creating a workflow
        print("\n1. Testing workflow creation...")
        workflow_id = await test_create_workflow(session)
        
        if workflow_id:
            # Test getting the created workflow
            print("\n2. Testing workflow retrieval...")
            await test_get_workflow(session, workflow_id)
            
            # Test updating workflow state
            print("\n3. Testing workflow state update...")
            await test_update_workflow_state(session, workflow_id)
        
        # Test listing workflows
        print("\n4. Testing workflow listing...")
        await test_list_workflows(session)
        
        print("\n=== API Tests Completed ===\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
