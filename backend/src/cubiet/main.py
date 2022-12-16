from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import base64
import random

from eth_account import messages, Account

from .cubie import Cube
from .image import visualize_cube
import cv2

from . import config

app = FastAPI()
acc = Account.from_key(config.SIGNER_KEY)
print(f"Signer is {acc.address}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

random.seed(config.SEED)
mintlist = {i: Cube.random() for i in range(1, 100)}
# mintlist[1] = Cube.zero()

# mintlist = {(i + 1): j for i, j in enumerate(Cube.moves())}
# mintlist[99] = Cube.zero()

mintlist_api = {k: {
    "cube": base64.b64encode(v.encode()),
    "sign": base64.b64encode(acc.sign_message(messages.encode_defunct(v.encode_with_id(k))).signature),
    "link": f"{config.BASE_URL}/metadata/{k}/{base64.b64encode(v.encode()).decode()}",
} for k, v in mintlist.items()}


@app.get("/metadata/{id}/{metadata}")
async def _metadata(id: int, metadata: str):
    cube = Cube.decode(base64.b64decode(metadata))
    return {
        "name": f"Cubie #{id:03d}",
        "description": await cube.solve(),
        "image": f"{config.BASE_URL}/image/{cube.to_facelets()}"
    }


@app.get("/image/{facelets}")
async def _image(facelets: str):
    img = visualize_cube(facelets)
    is_ok, enc = cv2.imencode(".jpg", img * 255)
    assert(is_ok)
    return Response(content=enc.tobytes(), media_type="image/jpeg")


@app.get("/mintlist")
async def _mintlist():
    return mintlist_api


def main():
    uvicorn.run("src.cubiet.main:app", host="0.0.0.0", port=8000, reload=True)