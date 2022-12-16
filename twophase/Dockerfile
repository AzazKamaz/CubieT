FROM pypy:3.9-slim

WORKDIR /app

RUN pip3 install RubikTwoPhase

CMD [ "pypy", "-u", "-m", "twophase.start_server", "8080", "25", "1" ]