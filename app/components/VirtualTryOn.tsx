"use client"
import { useRef, useEffect, useState } from "react"
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision"

export default function VirtualTryOn({ glassesImg }: { glassesImg: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let landmarker: FaceLandmarker | null = null
    let animationId = 0
    let stream: MediaStream | null = null
    let cancelled = false

    const stopStream = () => {
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    async function init() {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("This browser does not support camera access.")
        return
      }

      stopStream()

      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        )

        landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        })

        stream = await navigator.mediaDevices.getUserMedia({ video: true })

        if (cancelled) {
          stopStream()
          return
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setReady(true)

        const glasses = new Image()
        glasses.crossOrigin = "anonymous"
        glasses.src = glassesImg

        const detect = () => {
          if (cancelled || !videoRef.current || !canvasRef.current || !landmarker) {
            return
          }

          if (videoRef.current.currentTime > 0) {
            const results = landmarker.detectForVideo(videoRef.current, performance.now())
            const ctx = canvasRef.current.getContext("2d")
            if (!ctx) return

            const canvas = canvasRef.current
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

            if (results.faceLandmarks.length > 0 && glasses.complete) {
              const landmarks = results.faceLandmarks[0]
              const leftEye = landmarks[33]
              const rightEye = landmarks[263]

              const eyeDist = Math.hypot(
                (rightEye.x - leftEye.x) * canvas.width,
                (rightEye.y - leftEye.y) * canvas.height
              )
              const centerX = ((leftEye.x + rightEye.x) / 2) * canvas.width
              const centerY = ((leftEye.y + rightEye.y) / 2) * canvas.height

              const w = eyeDist * 2.4
              const h = w * 0.45

              ctx.drawImage(glasses, centerX - w / 2, centerY - h / 2, w, h)
            }
          }

          animationId = requestAnimationFrame(detect)
        }

        detect()
      } catch (error) {
        console.error("Camera initialization failed:", error)
        stopStream()
        setReady(false)
      }
    }

    init()

    return () => {
      cancelled = true
      cancelAnimationFrame(animationId)
      stopStream()
      landmarker?.close()
      landmarker = null
    }
  }, [glassesImg])

  return (
    <div className="relative w-full h-full bg-black rounded-[24px] overflow-hidden">
      {!ready && <div className="absolute inset-0 flex items-center justify-center text-white text-sm z-10">Loading Face AI...</div>}
      <video ref={videoRef} className="hidden" autoPlay playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover scale-x-[-1]" />
      <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full text-[10px]">● AI Tracking Active</div>
    </div>
  )
}