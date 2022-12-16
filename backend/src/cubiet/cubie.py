from twophase.cubie import CubieCube, Co, Ed, moveCube
from twophase.face import FaceCube
import eth_abi
import eth_abi.packed
import asyncio

from . import config

METADATA_TYPE = ["(uint256,uint256,bytes8,bytes8,bytes12,bytes12)"]


class Cube:
    def __init__(self, parentA: int, parentB: int, cube: CubieCube) -> None:
        self.parentA = parentA
        self.parentB = parentB
        self.cube = cube

    def zero():
        return Cube(0, 0, CubieCube())

    def moves():
        return [Cube(0, 0, i) for i in moveCube]
    
    def encode(self) -> bytes:
        return eth_abi.encode(
            METADATA_TYPE,
            [(
                self.parentA,
                self.parentB,
                bytes(map(int, self.cube.cp)),
                bytes(self.cube.co),
                bytes(map(int, self.cube.ep)),
                bytes(self.cube.eo),
            )]
        )
    
    def encode_with_id(self, id: int) -> bytes:
        return eth_abi.encode(
            ["uint256"] + METADATA_TYPE,
            [id, (
                self.parentA,
                self.parentB,
                bytes(map(int, self.cube.cp)),
                bytes(self.cube.co),
                bytes(map(int, self.cube.ep)),
                bytes(self.cube.eo),
            )]
        )
    
    def decode(data):
        data = eth_abi.decode(METADATA_TYPE, data)
        return Cube(
            data[0][0],
            data[0][1],
            CubieCube(
                list(map(Co, data[0][2])),
                list(map(int, data[0][3])),
                list(map(Ed, data[0][4])),
                list(map(int, data[0][5])),
            )
        )
    
    def random():
        cc = CubieCube()
        cc.randomize()
        return Cube(0, 0, cc)
    
    def to_facelets(self) -> str:
        return self.cube.to_facelet_cube().to_string()
    
    def from_facelets(facelets) -> str:
        fc = FaceCube()
        fc.from_string(facelets)
        return Cube(0, 0, fc.to_cubie_cube())
    
    async def solve(self) -> str:
        facelets = self.to_facelets()
        reader, writer = await asyncio.open_connection(config.SOLVER_HOST, 8080)
        writer.writelines([facelets.encode(), b"\n"])
        writer.write_eof()
        await writer.drain()

        data = await reader.readline()
        data = data.decode()

        writer.close()
        await writer.wait_closed()

        return data
