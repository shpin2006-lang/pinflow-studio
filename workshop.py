import serial
import pygame

# change COM7 to your port
ser = serial.Serial('COM7', 115200)

pygame.mixer.init()

# simple tone generator (beep sound)
def play_sound(freq):
    duration = 0.2
    sample_rate = 44100

    n_samples = int(sample_rate * duration)
    buf = bytearray()

    for s in range(n_samples):
        t = s / sample_rate
        val = int(127 * (1 + __import__('math').sin(2 * 3.14 * freq * t)))
        buf.append(val)

    sound = pygame.mixer.Sound(buffer=bytes(buf))
    sound.play()

while True:
    try:
        line = ser.readline().decode().strip()
        d = int(line)

        # map distance → frequency
        freq = max(200, min(1000, 2000 - d * 10))

        play_sound(freq)

    except:
        pass