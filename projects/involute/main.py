import math
import os

# constants
dtr = (22 / 7) / 180
rtd = 180 / (22 / 7)

def side(a: int, t1: float) -> float:
  return a * t1 * dtr

def angle(a: int, b: float, t1: float, decimals: int) -> float:
  t2 = math.atan(b / a) * rtd
  return round(t1 - t2, decimals)

def hypotenuse(a: float, b: float) -> float:
  return math.sqrt(a**2 + b**2)

def angle_mapper(a: int, decimals: int):
  t1 = 0
  map = {}
  precision = 1
  for i in range(decimals):
    precision /= 10
  while True:
    b = side(a, t1)
    t2 = angle(a, b, t1, decimals)
    if t2 >= 360:
      break
    map[t2] = t1
    t1 += precision
  return map

def distance_mapper(a, map: dict):
  for key in map:
    b = side(a, map[key])
    c = hypotenuse(a, b)
    map[key] = c
  return map

def average_mapper(map: dict, decimals: int):
  count = {}
  average = {}
  for key in map:
    key2 = math.ceil(key)
    if key2 >= 360:
      break
    if key2 in count:
      count[key2] += 1
    else:
      count[key2] = 1
    if key2 in average:
      average[key2] += map[key]
    else:
      average[key2] = map[key]
  for key in average:
    average[key] = round(average[key] / count[key], decimals)
  return average

def print_map(map: dict, diff: int):
  for key in map:
    if key % diff == 0:
      print("{}°\t-> {}".format(key, map[key]))

def calculate(a: int, decimals: int):
  os.system('cls')
  print("Maping Angles...")
  map = angle_mapper(a, decimals)
  os.system('cls')
  print("Calculating Distances...")
  map = distance_mapper(a, map)
  os.system('cls')
  print("Optimizing...")
  map = average_mapper(map, decimals)
  return map

while True:
  os.system('cls')
  print("Enter radius: ", end = '')
  radius = int(input())
  print("Enter angle delta: ", end = '')
  delta = int(input())
  map = calculate(radius, 2)
  os.system('cls')
  print_map(map, delta)
  input()