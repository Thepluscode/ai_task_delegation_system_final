"""
Simple Healthcare Mock Service for Dashboard
Port: 8012
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="Healthcare Mock Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "healthcare", "port": 8012}

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Healthcare Mock Service", "status": "running"}

@app.get("/api/v1/auth/login")
async def mock_login():
    """Mock login endpoint"""
    return {"status": "success", "message": "Healthcare service available"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8012)
