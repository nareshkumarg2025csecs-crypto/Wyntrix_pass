'use client';

import React, { useRef, useEffect, useReducer, useCallback } from 'react';
import { MascotState, MascotFSMState, MascotAction } from './types';
import { ParticleSystem } from './particles';
import { renderByte } from './ByteEngine';

interface ByteMascotProps {
  state?: MascotState;
  pixelScale?: number; // Default 4x -> 384x384px
  className?: string;
  onWake?: () => void;
}

const INITIAL_FSM_STATE: MascotFSMState = {
  currentState: 'IDLE',
  frameIndex: 0,
  subFrame: 0,
  headShakeOffset: 0,
  jumpOffset: 0,
  isBlinking: false,
  earTwitch: false,
  tailFrame: 1,
  isYawning: false,
  idleSeconds: 0,
  radarAngle: 0,
};

function fsmReducer(state: MascotFSMState, action: MascotAction): MascotFSMState {
  switch (action.type) {
    case 'SET_STATE': {
      const isNewState = state.currentState !== action.state;
      return {
        ...state,
        currentState: action.state,
        idleSeconds: 0, // Reset idle timer on state change
        // Little jump when waking up from sleep or transitioning to happy/excited
        jumpOffset: state.currentState === 'SLEEP' ? -3 : 0,
        frameIndex: isNewState ? 0 : state.frameIndex,
      };
    }

    case 'USER_INTERACTION': {
      // Wake up if asleep
      if (state.currentState === 'SLEEP') {
        return {
          ...state,
          currentState: 'IDLE',
          idleSeconds: 0,
          jumpOffset: -3,
        };
      }
      return {
        ...state,
        idleSeconds: 0,
      };
    }

    case 'TRIGGER_BLINK': {
      return { ...state, isBlinking: true };
    }

    case 'TRIGGER_EAR_TWITCH': {
      return { ...state, earTwitch: true };
    }

    case 'TRIGGER_YAWN': {
      return { ...state, isYawning: true };
    }

    case 'TICK': {
      const nextFrame = (state.frameIndex + 1) % 60;
      let nextHeadShake = 0;
      let nextJump = 0;

      // 1. Head shake logic (2px stepped on 96x96 grid)
      if (state.currentState === 'TIER_0' || state.currentState === 'ANGRY') {
        // Fast head shake: alternate +2, -2, +1, -1, 0
        const shakePattern = [2, -2, 2, -2, 0];
        nextHeadShake = shakePattern[nextFrame % shakePattern.length];
      } else if (state.currentState === 'TIER_1') {
        // Slower worried head shake
        const slowPattern = [2, 1, 0, -1, -2, 0];
        nextHeadShake = slowPattern[nextFrame % slowPattern.length];
      } else if (state.currentState === 'FOCUS_USER' || state.currentState === 'EMPTY_SUBMIT') {
        // Curious head tilt (shifted 2px right)
        nextHeadShake = 2;
      }

      // 2. Jump / Bounce logic
      if (
        state.currentState === 'TIER_3' ||
        state.currentState === 'TIER_4' ||
        state.currentState === 'EXCITED'
      ) {
        // Stepped jump
        const jumpPattern = [0, -3, -5, -3, 0, 0];
        nextJump = jumpPattern[nextFrame % jumpPattern.length];
      } else if (state.jumpOffset < 0) {
        // Recovery from jump
        nextJump = 0;
      }

      // 3. Tail wag cycle (0 -> 1 -> 2 -> 1)
      const tailPattern = [0, 1, 2, 1];
      const nextTail = tailPattern[Math.floor(nextFrame / 3) % tailPattern.length];

      // 4. Auto-clear blink / ear twitch / yawn after short duration
      const nextBlink = state.isBlinking && nextFrame % 3 !== 0;
      const nextTwitch = state.earTwitch && nextFrame % 4 !== 0;
      const nextYawn = state.isYawning && nextFrame % 8 !== 0;

      // 5. Radar sweep for sniffing
      const nextRadar = (state.radarAngle + 20) % 360;

      return {
        ...state,
        frameIndex: nextFrame,
        headShakeOffset: nextHeadShake,
        jumpOffset: nextJump,
        tailFrame: nextTail,
        isBlinking: nextBlink,
        earTwitch: nextTwitch,
        isYawning: nextYawn,
        radarAngle: nextRadar,
      };
    }

    default:
      return state;
  }
}

export function ByteMascot({
  state: externalState = 'IDLE',
  pixelScale = 4,
  className = '',
  onWake,
}: ByteMascotProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fsm, dispatch] = useReducer(fsmReducer, {
    ...INITIAL_FSM_STATE,
    currentState: externalState,
  });

  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const squashFramesRef = useRef<number>(0);
  const keyBobRef = useRef<number>(0);

  // Synchronize external state prop changes and trigger 2-frame squash
  useEffect(() => {
    dispatch({ type: 'SET_STATE', state: externalState });
    squashFramesRef.current = 2; // 2 frames of squash animation on state change
  }, [externalState]);

  // Handle user interaction to reset idle timer or wake Byte
  const handleInteraction = useCallback(() => {
    if (fsm.currentState === 'SLEEP') {
      onWake?.();
    }
    dispatch({ type: 'USER_INTERACTION' });
  }, [fsm.currentState, onWake]);

  useEffect(() => {
    const handleGlobalKey = () => {
      handleInteraction();
      keyBobRef.current = 1; // 1px vertical bob on keystroke
    };
    const handleGlobalClick = () => handleInteraction();

    window.addEventListener('keydown', handleGlobalKey);
    window.addEventListener('click', handleGlobalClick);
    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [handleInteraction]);

  // Random idle behaviors: blinking, ear twitches, yawning, 30s sleep check
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (fsm.currentState === 'IDLE' && !fsm.isBlinking) {
        dispatch({ type: 'TRIGGER_BLINK' });
      }
    }, 3800);

    const twitchInterval = setInterval(() => {
      if (fsm.currentState === 'IDLE' && !fsm.earTwitch) {
        dispatch({ type: 'TRIGGER_EAR_TWITCH' });
      }
    }, 5500);

    const yawnInterval = setInterval(() => {
      if (fsm.currentState === 'IDLE' && !fsm.isYawning && Math.random() > 0.6) {
        dispatch({ type: 'TRIGGER_YAWN' });
      }
    }, 18000);

    // Inactivity timer towards 30s sleep
    const idleSecondsTimer = setInterval(() => {
      if (fsm.currentState === 'IDLE') {
        const nextSec = fsm.idleSeconds + 1;
        if (nextSec >= 30) {
          dispatch({ type: 'SET_STATE', state: 'SLEEP' });
        } else {
          fsm.idleSeconds = nextSec;
        }
      }
    }, 1000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(twitchInterval);
      clearInterval(yawnInterval);
      clearInterval(idleSecondsTimer);
    };
  }, [fsm]);

  // Main Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    // 6 fps for idle/sleep (166ms per frame); 12 fps for active reactions (83ms per frame)
    const isActive =
      fsm.currentState !== 'IDLE' && fsm.currentState !== 'SLEEP';
    const targetFps = isActive ? 12 : 6;
    const intervalMs = 1000 / targetFps;

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;

      if (delta >= intervalMs) {
        lastTime = currentTime - (delta % intervalMs);

        // Advance FSM frame
        dispatch({ type: 'TICK' });

        // Spawn particles based on current state (safe zones outside head)
        const particles = particlesRef.current;
        if (fsm.currentState === 'HAPPY' || fsm.currentState === 'TIER_4') {
          if (Math.random() > 0.4) particles.spawnHeart();
          if (fsm.currentState === 'TIER_4' && Math.random() > 0.3) particles.spawnConfetti();
        } else if (fsm.currentState === 'TIER_3' || fsm.currentState === 'EXCITED') {
          if (Math.random() > 0.35) particles.spawnStar();
        } else if (fsm.currentState === 'TIER_0') {
          if (Math.random() > 0.3) particles.spawnSweat(78, 32);
        } else if (fsm.currentState === 'TIER_1') {
          if (Math.random() > 0.6) particles.spawnSweat(78, 32);
        } else if (fsm.currentState === 'ANGRY') {
          if (Math.random() > 0.35) particles.spawnSteam();
        } else if (fsm.currentState === 'THINKING') {
          if (Math.random() > 0.7) particles.spawnQuestion(78, 14);
        } else if (fsm.currentState === 'PROCESSING') {
          if (Math.random() > 0.5) particles.spawnGear(48, 10);
        } else if (fsm.currentState === 'SLEEP') {
          if (Math.random() > 0.65) particles.spawnZzz(78, 16);
        }

        particles.update();
      }

      // Compute squash and bob offsets
      let squashOffset = 0;
      if (squashFramesRef.current > 0) {
        squashOffset = 2;
        squashFramesRef.current--;
      }
      if (keyBobRef.current > 0) {
        squashOffset += 1;
        keyBobRef.current = 0;
      }

      // Render frame to canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const renderState: MascotFSMState = prefersReducedMotion
            ? { ...fsm, headShakeOffset: 0, jumpOffset: 0 }
            : fsm;

          renderByte({
            ctx,
            state: renderState,
            particles: particlesRef.current,
            pixelScale,
            squashOffset: prefersReducedMotion ? 0 : squashOffset,
          });
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [fsm, pixelScale]);

  return (
    <div
      onClick={handleInteraction}
      className={`relative inline-block cursor-pointer select-none ${className}`}
      title={`Byte the Shiba Pup (${fsm.currentState}) - Click to pet!`}
    >
      <canvas
        ref={canvasRef}
        width={96 * pixelScale}
        height={96 * pixelScale}
        className="pixelated block mx-auto drop-shadow-md max-w-full h-auto"
        style={{
          width: `${96 * pixelScale}px`,
          height: `${96 * pixelScale}px`,
        }}
      />
    </div>
  );
}
