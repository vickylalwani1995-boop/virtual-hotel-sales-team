import os, json, logging
from fastapi import APIRouter, Request, HTTPException
from dotenv import load_dotenv
from livekit import api

load_dotenv(".env")
logger = logging.getLogger("hospitality-inbound")
router = APIRouter()


@router.post("/webhook/inbound-call")
async def handle_inbound_call(request: Request):
    try:
        payload = await request.json()
        logger.info(f"Inbound webhook: {payload}")
        caller = payload.get("caller_number", "unknown")
        room = payload.get("room_name", f"inbound-{caller}")
        # All inbound → Donna (Captain), she routes verbally
        livekit_agent = "agent_donna"
        hotel_data = {
            "hotelName": os.getenv("HOTEL_NAME", "The Westmore Hotel Dallas"),
            "location": os.getenv("HOTEL_LOCATION", "Downtown Dallas"),
            "rooms": int(os.getenv("HOTEL_ROOMS", "220")),
            "adr": float(os.getenv("HOTEL_ADR", "189")),
            "occupancy": os.getenv("HOTEL_OCCUPANCY", "62"),
            "targetBusiness": os.getenv("HOTEL_TARGET", "corporate"),
            "weakDays": os.getenv("HOTEL_WEAK_DAYS", "Sun-Tue"),
            "meetingSpace": os.getenv("HOTEL_MEETING", "4 halls"),
        }
        metadata = json.dumps({
            "agentId": "01_donna",
            "callDirection": "inbound",
            "callerNumber": caller,
            "hotelData": hotel_data,
        })
        lkapi = api.LiveKitAPI(
            url=os.getenv("LIVEKIT_URL"),
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )
        try:
            await lkapi.agent_dispatch.create_dispatch(
                api.CreateAgentDispatchRequest(
                    agent_name=livekit_agent, room=room, metadata=metadata
                )
            )
            return {"success": True, "routed_to": "01_donna", "room": room}
        finally:
            await lkapi.aclose()
    except Exception as e:
        logger.error(f"Inbound failed: {e}")
        raise HTTPException(500, str(e))
