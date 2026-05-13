# Hospitality Voice Backend

AI-powered inbound + outbound call handling for hotel sales teams using LiveKit Agents and OpenAI.

## Agents

| Agent | ID | Voice | Role |
|---|---|---|---|
| Donna Marie | `agent_donna` | shimmer | Director of Sales — answers all inbound, routes calls |
| Marcus Reed | `agent_marcus` | echo | Lead Gen — qualifies new prospects |
| Sarah Chen | `agent_sarah` | nova | Outbound Sales — closes deals |
| Priya Sharma | `agent_priya` | alloy | Group & RFP — large event sales |
| Liam Chen | `agent_liam` | fable | Customer Success — post-stay + complaints |
| Maya Reddy | `agent_maya` | alloy | Revenue Analytics — rates + pricing |

## Setup

```bash
cd backend
cp .env.example .env
# Fill in your keys in .env
pip install -r requirements.txt
```

## Run

**Start all 6 agents:**
```bash
python run_agents.py
```

**Start the API server:**
```bash
uvicorn main:app --reload --port 8000
```

## Test outbound call

```bash
curl -X POST http://localhost:8000/api/call \
  -H "Content-Type: application/json" \
  -H "X-Api-Secret: YOUR_VOICE_API_SECRET" \
  -d '{
    "agentId": "03_sarah",
    "contacts": [{"leadName": "John Smith", "phoneNumber": "+12125550100", "leadTitle": "Travel Manager", "companyName": "Acme Corp"}],
    "hotelData": {
      "hotelName": "The Westmore Hotel Dallas",
      "location": "Downtown Dallas, TX",
      "rooms": 220,
      "adr": 189,
      "targetBusiness": "corporate travel",
      "weakDays": "Sunday through Tuesday",
      "meetingSpace": "4 banquet halls",
      "occupancy": "62"
    }
  }'
```

## Inbound call webhook

Configure LiveKit SIP trunk to POST to:
```
POST /api/webhook/inbound-call
```

All inbound calls are routed to Donna Marie (agent_donna) who handles routing verbally.

## Twilio → LiveKit SIP Trunk Setup

1. In Twilio: buy a phone number, create a SIP trunk, point the trunk's origination URI to your LiveKit SIP endpoint.
2. In LiveKit dashboard: create an inbound SIP trunk, link your Twilio number.
3. Set `SIP_OUTBOUND_TRUNK_ID` in `.env` from the LiveKit dashboard trunk ID.
4. Twilio handles PSTN connectivity — the Python app never needs Twilio credentials directly.

## Deploy to Render

1. Push `backend/` as a separate service (Python/FastAPI).
2. Set all env vars from `.env.example` in Render's environment settings.
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Run agents separately (worker process): `python run_agents.py`
5. Set `VOICE_BACKEND_URL` in the Next.js frontend env to the Render service URL.

## Cost estimate

~$0.10 per call (OpenAI gpt-4o-mini TTS + Deepgram STT + LiveKit).
