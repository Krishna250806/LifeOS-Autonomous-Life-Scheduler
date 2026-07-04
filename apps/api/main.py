import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="LifeOS API",
    description="Autonomous scheduling agent backend using FastAPI & LangGraph.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# Pydantic Schemas (mirrors Zod schemas in packages)
# ----------------------------------------------------

class ScheduleBlock(BaseModel):
    id: str
    title: str
    startTime: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    endTime: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    duration: int
    type: str  # fixed, flexible, sleep, buffer, routine
    category: str  # work, health, education, leisure, essential
    isCompleted: bool
    isSkipped: bool
    rationale: Optional[str] = None
    goalId: Optional[str] = None
    habitId: Optional[str] = None

class GoalIntakeRequest(BaseModel):
    intent: str

class ReplanResponse(BaseModel):
    message: str
    addedBlocks: List[ScheduleBlock]
    deferredBlocks: List[ScheduleBlock]

# ----------------------------------------------------
# Endpoints
# ----------------------------------------------------

@app.get("/")
async def root():
    return {"status": "LifeOS Scheduling Service Online"}

@app.post("/api/intake", response_model=ReplanResponse)
async def process_intent(payload: GoalIntakeRequest):
    """
    LangGraph pipeline parsing:
    parse_intent -> classify_goal_type -> extract_constraints -> generate_plan_skeleton -> conflict_resolution
    """
    intent = payload.intent.lower()
    
    # Mocking LangGraph pipeline execution
    if "exam" in intent or "study" in intent:
        return {
            "message": "Parsed exam preparation intent. Scheduled intensive study blocks at energy peaks.",
            "addedBlocks": [
                {
                    "id": "back_study_1",
                    "title": "Focused Exam Study: Practice Questions",
                    "startTime": "09:00",
                    "endTime": "11:00",
                    "duration": 120,
                    "type": "flexible",
                    "category": "education",
                    "isCompleted": False,
                    "isSkipped": False,
                    "rationale": "High focus study slot generated from target exam horizon."
                }
            ],
            "deferredBlocks": []
        }
        
    elif "tired" in intent or "fatigue" in intent:
        return {
            "message": "Exhaustion protocol triggered. Deferring evening sprints.",
            "addedBlocks": [
                {
                    "id": "back_rec_1",
                    "title": "Rest & Guided Breathing (AI Prescribed)",
                    "startTime": "14:30",
                    "endTime": "16:00",
                    "duration": 90,
                    "type": "buffer",
                    "category": "health",
                    "isCompleted": False,
                    "isSkipped": False,
                    "rationale": "Restorative recovery buffer scheduled due to energy drop."
                }
            ],
            "deferredBlocks": []
        }
        
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unable to determine context intent. Please try phrasing with 'exam' or 'tired' to invoke re-planners."
    )

@app.post("/api/overwhelm", response_model=ReplanResponse)
async def trigger_overwhelm():
    """
    Stripped down schedule keeping only essential/fixed slots and scheduling recovery breaks.
    """
    return {
        "message": "Overwhelm protocol active: low-priority tasks deferred; restorative break blocks active.",
        "addedBlocks": [
            {
                "id": "back_overwhelm_break",
                "title": "Restorative Offline Buffer",
                "startTime": "15:00",
                "endTime": "16:30",
                "duration": 90,
                "type": "buffer",
                "category": "health",
                "isCompleted": False,
                "isSkipped": False,
                "rationale": "Overwhelm protocol: inserting offline recovery time."
            }
        ],
        "deferredBlocks": []
    }
