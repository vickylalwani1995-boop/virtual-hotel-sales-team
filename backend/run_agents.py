import subprocess, sys, os

AGENTS = [
    "agent_donna_marie.py",
    "agent_marcus_reed.py",
    "agent_sarah_chen.py",
    "agent_priya_sharma.py",
    "agent_liam_chen.py",
    "agent_maya_reddy.py",
]


def run():
    procs = [
        (a, subprocess.Popen([sys.executable, a, "start"]))
        for a in AGENTS if os.path.exists(a)
    ]
    print(f"Launched {len(procs)} agents. Ctrl+C to stop.")
    try:
        for _, p in procs:
            p.wait()
    except KeyboardInterrupt:
        for _, p in procs:
            p.terminate()


if __name__ == "__main__":
    run()
