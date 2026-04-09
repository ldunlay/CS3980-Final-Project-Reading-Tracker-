# CS3980 Final Project (Reading Tracker)

We developed a comprehensive and user-friendly book tracking application that allows users to organize book lists, track their reading progress, write reviews, obtain statistics on reading habits, and set reading goals

___

<strong> Steps for running app: </strong>
1. Create virtual environment(run this the first time you pull the code because the virtual environment isn't pushed to github):

python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

2. Activate virtual environment by running .\venv\Scripts\Activate.ps1 in the terminal

3. Run app after activating virtual environment by running in the terminal:  uvicorn main:app --reload

MongoDB

1. Copy `.env.example` to `.env`.
2. Update `MONGODB_URI` and `MONGODB_DB` in `.env`.

___

## Sources

Dashboard styling source: https://www.youtube.com/watch?v=NnniXasJIpY and ClaudeAI

Photo on main page: Photo by <a href="https://unsplash.com/@borodinanadi?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">nadi borodina</a> on <a href="https://unsplash.com/photos/white-and-pink-flowers-on-white-printer-paper-xkx93Q2Pe8E?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a>
      
