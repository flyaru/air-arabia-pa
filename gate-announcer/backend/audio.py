"""44.1kHz mono, conservative loudness and peak limiting, MP3 with chimes."""
import math
from pathlib import Path
import struct
import wave
import imageio_ffmpeg
from .tts import command

def create_chime(path):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 if path.exists():return
 sr=44100;data=[]
 for i in range(int(sr*1.1)):
  t=i/sr;s=0
  for start,freq in [(0,659.25),(.32,880)]:
   age=t-start
   if 0<=age<.7:s+=.20*min(age/.012,1)*math.exp(-age*5)*math.sin(2*math.pi*freq*age)
  data.append(struct.pack('<h',int(max(-1,min(1,s))*32767)))
 with wave.open(str(path),'wb') as w:w.setparams((1,2,sr,0,'NONE','not compressed'));w.writeframes(b''.join(data))

async def master(raw,out,chime,gap,engine,rate,pitch,volume):
 ffmpeg=imageio_ffmpeg.get_ffmpeg_exe();args=[ffmpeg,'-v','error','-y','-i',raw]
 fx='aresample=44100,aformat=sample_fmts=fltp:channel_layouts=mono'
 if engine=='piper':
  speed=1+int(rate[:-1])/100
  # Approximate Hz shift around a 150Hz reference; exact vocal F0 is voice-dependent.
  factor=max(.65,min(1.5,1+int(pitch[:-2])/150))
  fx+=f',asetrate={44100*factor},aresample=44100,atempo={speed/factor}'
 fx+=',loudnorm=I=-18:TP=-2:LRA=7'
 # Keep relative user volume after normalisation and cap output peaks.
 gain=max(0,1+int(volume[:-1])/100)
 fx+=f',volume={gain},alimiter=limit=0.79:level=false'
 if chime:
  args+=['-i',chime]
  filt=f'[0:a]{fx}[voice];[1:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=mono,asplit=2[c1][c2];anullsrc=r=44100:cl=mono,atrim=duration={gap}[s1];anullsrc=r=44100:cl=mono,atrim=duration={gap}[s2];[c1][s1][voice][s2][c2]concat=n=5:v=0:a=1[out]'
 else:filt=f'[0:a]{fx}[out]'
 await command(*args,'-filter_complex',filt,'-map','[out]','-ar','44100','-ac','1','-c:a','libmp3lame','-b:a','192k','-f','mp3',out,timeout=60)
