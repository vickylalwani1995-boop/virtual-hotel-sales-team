import asyncio, os, logging, json
from dotenv import load_dotenv
from livekit import api

load_dotenv(".env")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hospitality-outbound")
trunk_id = os.getenv("SIP_OUTBOUND_TRUNK_ID")

AGENT_MAP = {
    "01_donna":  "agent_donna",
    "02_marcus": "agent_marcus",
    "03_sarah":  "agent_sarah",
    "04_priya":  "agent_priya",
    "05_liam":   "agent_liam",
    "06_maya":   "agent_maya",
}


def to_e164(number: str) -> str:
    digits = ''.join(filter(str.isdigit, number))
    if number.strip().startswith('+'):
        return '+' + digits
    if len(digits) == 10:
        return '+91' + digits  # Indian 10-digit mobile
    return '+' + digits  # assume country code already present


async def make_call(phone_number, lead_name, hotel_data, lead_meta, agent_id="03_sarah"):
    phone_number = to_e164(phone_number)
    clean = ''.join(filter(str.isdigit, phone_number))
    livekit_agent = AGENT_MAP.get(agent_id, "agent_sarah")
    room = f"hospitality-{agent_id}-{clean}"
    metadata = json.dumps({
        "agentId": agent_id,
        "callDirection": "outbound",
        "leadName": lead_name,
        "phoneNumber": phone_number,
        "hotelData": hotel_data,
        "leadMeta": lead_meta,
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
        await lkapi.sip.create_sip_participant(
            api.CreateSIPParticipantRequest(
                room_name=room, sip_trunk_id=trunk_id,
                sip_call_to=phone_number,
                participant_identity="phone_user",
                wait_until_answered=True,
            )
        )
        logger.info(f"Outbound to {lead_name} via {agent_id} answered")
    except Exception as e:
        logger.error(f"Call failed: {e}")
    finally:
        await lkapi.aclose()
