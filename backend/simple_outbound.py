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
        return '+' + digits  # already has country code — trust it
    if len(digits) == 11 and digits.startswith('1'):
        return '+' + digits  # US 11-digit (1 + area + number)
    if len(digits) == 12 and digits.startswith('91'):
        return '+' + digits  # Indian 12-digit (91 + 10-digit mobile)
    if len(digits) == 10:
        # Ambiguous — Indian mobiles start with 6-9, but so do many US area codes.
        # Caller should use +91 or +1 prefix. Default to +1 (US hotel context).
        return '+1' + digits
    return '+' + digits


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
    lk_url = os.getenv("LIVEKIT_URL")
    lk_key = os.getenv("LIVEKIT_API_KEY")
    lk_secret = os.getenv("LIVEKIT_API_SECRET")
    if not lk_url or not lk_key or not lk_secret:
        missing = [k for k, v in {"LIVEKIT_URL": lk_url, "LIVEKIT_API_KEY": lk_key, "LIVEKIT_API_SECRET": lk_secret}.items() if not v]
        raise RuntimeError(f"Missing LiveKit env vars: {', '.join(missing)}")
    if not trunk_id:
        raise RuntimeError("SIP_OUTBOUND_TRUNK_ID is not set")

    lkapi = api.LiveKitAPI(url=lk_url, api_key=lk_key, api_secret=lk_secret)
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
        raise
    finally:
        await lkapi.aclose()
