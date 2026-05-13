#!/bin/sh
# Start all 6 LiveKit agent workers in the background
python agent_donna_marie.py start &
python agent_marcus_reed.py start &
python agent_sarah_chen.py start &
python agent_priya_sharma.py start &
python agent_liam_chen.py start &
python agent_maya_reddy.py start &

# Start the HTTP API in the foreground (keeps the container alive)
exec uvicorn main:app --host 0.0.0.0 --port $PORT
