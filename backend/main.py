import os, asyncio
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from simple_outbound import make_call
from inbound_handler import router as inbound_router

load_dotenv(".env")
API_SECRET = os.getenv("VOICE_API_SECRET", "")

app = FastAPI(title="mySales TEAM AI — Voice Backend")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)
app.include_router(inbound_router, prefix="/api")

VALID_AGENTS = ["01_donna", "02_marcus", "03_sarah", "04_priya", "05_liam", "06_maya"]


class Contact(BaseModel):
    leadName: str
    phoneNumber: str
    leadTitle: str = ""
    companyName: str = ""


class HotelData(BaseModel):
    hotelName: str
    location: str
    rooms: int
    adr: float
    targetBusiness: str
    weakDays: str
    meetingSpace: str = "available"
    occupancy: str = "62"


class OutboundRequest(BaseModel):
    contacts: List[Contact]
    hotelData: HotelData
    agentId: str = "03_sarah"


def check_auth(x_api_secret: str):
    if not API_SECRET:
        return  # dev mode: auth disabled if no secret set
    if x_api_secret != API_SECRET:
        raise HTTPException(401, "Unauthorized")


@app.get("/")
async def root():
    return {"service": "mySales TEAM AI Voice", "agents": VALID_AGENTS}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/call")
async def start_outbound_calls(
    payload: OutboundRequest,
    x_api_secret: str = Header(default="")
):
    check_auth(x_api_secret)
    if not payload.contacts:
        raise HTTPException(400, "No contacts")
    if payload.agentId not in VALID_AGENTS:
        raise HTTPException(400, f"Invalid agentId. Use: {VALID_AGENTS}")
    hotel = payload.hotelData.dict()
    try:
        await asyncio.gather(*(
            make_call(
                c.phoneNumber, c.leadName, hotel,
                {"leadTitle": c.leadTitle, "companyName": c.companyName},
                payload.agentId
            )
            for c in payload.contacts
        ))
        return {"success": True, "count": len(payload.contacts), "agent": payload.agentId}
    except Exception as e:
        raise HTTPException(500, str(e))
