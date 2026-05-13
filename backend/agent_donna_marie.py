from dotenv import load_dotenv
import logging, json
from livekit.agents import AgentSession, Agent, JobContext, cli, WorkerOptions
try:
    from livekit.agents.voice import EndCallTool
except ImportError:
    try:
        from livekit.agents.beta import EndCallTool
    except ImportError:
        EndCallTool = None
from livekit.plugins import silero
from livekit.plugins.openai import LLM, TTS
from livekit.plugins.deepgram import STT
from prompt import SYSTEM_PROMPT_DONNA_MARIE
from functions import capture_lead, send_lead_email, route_to_agent

load_dotenv(".env")
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("agent-donna")

TTS_VOICE = "shimmer"
AGENT_NAME = "agent_donna"


class DonnaMarieAgent(Agent):
    def __init__(self, call_direction, lead_name, hotel, lead_meta):
        self.call_direction = call_direction
        self.lead_name = lead_name or "there"
        self.hotel = hotel or {}
        prompt = SYSTEM_PROMPT_DONNA_MARIE.format(
            HOTEL_NAME=self.hotel.get("hotelName", "our hotel"),
            LOCATION=self.hotel.get("location", ""),
            ROOMS=self.hotel.get("rooms", 200),
            ADR=self.hotel.get("adr", 189),
            OCCUPANCY=self.hotel.get("occupancy", 62),
            TARGET_BUSINESS=self.hotel.get("targetBusiness", "corporate"),
            WEAK_DAYS=self.hotel.get("weakDays", "weekdays"),
            MEETING_SPACE=self.hotel.get("meetingSpace", "available"),
            LEAD_NAME=self.lead_name,
            LEAD_TITLE=(lead_meta or {}).get("leadTitle", "Decision Maker"),
            COMPANY_NAME=(lead_meta or {}).get("companyName", "your company"),
        )
        prompt += f"\n\nCALL_DIRECTION: {call_direction.upper()}."
        _tools = ([EndCallTool()] if EndCallTool else []) + [capture_lead, route_to_agent]
        super().__init__(instructions=prompt, tools=_tools)

    async def on_enter(self):
        hotel_name = self.hotel.get("hotelName", "our hotel")
        if self.call_direction == "outbound":
            self.session.say(
                text=f"Hi {self.lead_name}, this is Donna Marie, Director of Sales at {hotel_name}. Do you have 30 seconds?"
            )
        else:
            self.session.say(
                text=f"Thank you for calling {hotel_name}, this is Donna Marie. How can I help you today?"
            )


async def donna_session(ctx: JobContext):
    await ctx.connect()
    data = json.loads(ctx.job.metadata or "{}")
    direction = data.get("callDirection", "outbound")
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=STT(),
        llm=LLM(model="gpt-4o-mini"),
        tts=TTS(voice=TTS_VOICE),
    )
    await session.start(
        room=ctx.room,
        agent=DonnaMarieAgent(
            call_direction=direction,
            lead_name=data.get("leadName"),
            hotel=data.get("hotelData", {}),
            lead_meta=data.get("leadMeta", {}),
        ),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=donna_session, agent_name=AGENT_NAME))
