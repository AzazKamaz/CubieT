import cv2
import numpy as np
from math import sin, cos, pi, atan

# Code uses OpenGL coordinate system

def _translate(x, y, z):
  return np.array([
    [1, 0, 0, x],
    [0, 1, 0, y],
    [0, 0, 1, z],
    [0, 0, 0, 1],
  ], dtype=np.float32)


def _rotate_yaw(a):
  return np.array([
    [cos(a), 0, -sin(a), 0],
    [0, 1, 0, 0],
    [sin(a), 0, cos(a), 0],
    [0, 0, 0, 1],
  ], dtype=np.float32)


def _rotate_pitch(a):
  return np.array([
    [1, 0, 0, 0],
    [0, cos(a), sin(a), 0],
    [0, -sin(a), cos(a), 0],
    [0, 0, 0, 1],
  ], dtype=np.float32)


def _vector(x, y, z):
  return np.array([[x], [y], [z], [1]], dtype=np.float32)


def _projection(left, right, bottom, top, near, far):
  return np.array([
    [2 * near / (right - left), 0, (right + left) / (right - left), 0],
    [0, 2 * near / (top - bottom), (top + bottom) / (top - bottom), 0],
    [0, 0, - (far + near) / (far - near), -2 * far * near / (far - near)],
    [0, 0, -1, 0],
  ], dtype=np.float32)


def _world_to_screen(poly, yaw, pitch, dist):
  poly = _rotate_yaw(yaw) @ poly
  poly = _rotate_pitch(pitch) @ poly
  poly = _translate(0, 0, -dist) @ poly
  poly = _projection(-0.16, 0.16, -0.12, 0.12, 0.2, 100) @ poly
  # poly = _rotate_pitch(-0.1) @ poly
  poly = (poly[:3, :] / poly[3]).transpose()

  # Check if polygon is facing camera
  norm = np.cross(poly[1] - poly[0], poly[2] - poly[0])
  if np.dot(norm, [0, 0, 1]) > 0:
    return None

  poly = poly[:, :2] * 0.5 + 0.5
  poly = (poly * [320, 240]).round().astype(np.int32)
  return poly


cell = np.concatenate([
  _vector(-0.5, -0.5, 0),
  _vector(-0.5, 0.5, 0),
  _vector(0.5, 0.5, 0),
  _vector(0.5, -0.5, 0),
], axis=1)

side = [_translate(x, y, 1.5) @ cell for y in [-1, 0, 1] for x in [-1, 0, 1]]
sides = [
  _rotate_pitch(-pi/2) @ side,
  _rotate_yaw(-pi/2) @ side,
  side,
  _rotate_pitch(pi/2) @ side,
  _rotate_yaw(pi/2) @ side,
  _rotate_yaw(pi) @ side,
]

colors = {
  'U': (255, 255, 255),
  'R': (185, 0, 0),
  'F': (0, 155, 72),
  'D': (255, 213, 0),
  'L': (255, 89, 0),
  'B': (0, 69, 173),
}


def visualize_cube(facelets):
  assert(len(facelets) == 9 * 6)

  w, h = 320, 240
  imgA, imgB = np.zeros((2, h, w, 3), dtype=np.float32)

  for i in range(6 * 9):
    color = [i / 255 for i in colors[facelets[i]][::-1]]
    side, cell = i // 9, i % 9
    poly = sides[side][cell]

    polyA = _world_to_screen(poly, -pi/4, atan(2 ** -0.5), 5)
    if polyA is not None:
      cv2.fillPoly(imgA, [polyA], color)
      cv2.drawContours(imgA, [polyA], 0, (0, 0, 0), 1)

    polyB = _world_to_screen(poly, -pi/4, atan(2 ** -0.5) + pi, 5)
    if polyB is not None:
      cv2.fillPoly(imgB, [polyB], color)
      cv2.drawContours(imgB, [polyB], 0, (0, 0, 0), 1)

  return imgA
#   return np.concatenate([imgA, imgB])