'use client'

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Button } from '@/components/ui/button'
import { Undo2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SignatureCanvasProps {
  width?: number
  height?: number
  className?: string
  onSignatureChange?: (hasSignature: boolean) => void
  disabled?: boolean
}

export interface SignatureCanvasMethods {
  getSignatureDataUrl: () => string | null
  getSignatureBlob: () => Promise<Blob | null>
  clear: () => void
  hasSignature: () => boolean
}

export const SignatureCanvas = forwardRef<SignatureCanvasMethods, SignatureCanvasProps>(({
  width = 400,
  height = 200,
  className,
  onSignatureChange,
  disabled = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignatureState, setHasSignatureState] = useState(false)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Save initial state
    const initialState = ctx.getImageData(0, 0, width, height)
    setHistory([initialState])
    setHistoryIndex(0)
  }, [width, height])

  // Save state to history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Remove any states after current index (if we undid something then drew)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)

    // Keep only last 20 states to save memory
    if (newHistory.length > 20) {
      newHistory.shift()
    }

    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Check if canvas has signature (not just white)
  const checkHasSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return false

    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Check if any pixel is not white
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        return true
      }
    }
    return false
  }, [])

  // Get drawing coordinates from event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in e) {
      const touch = e.touches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      }
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  // Draw
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return

    const coords = getCoordinates(e)
    if (!coords) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
  }

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    saveToHistory()

    const hasSig = checkHasSignature()
    setHasSignatureState(hasSig)
    onSignatureChange?.(hasSig)
  }

  // Undo
  const undo = () => {
    if (historyIndex <= 0 || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const newIndex = historyIndex - 1
    ctx.putImageData(history[newIndex], 0, 0)
    setHistoryIndex(newIndex)

    const hasSig = newIndex > 0
    setHasSignatureState(hasSig)
    onSignatureChange?.(hasSig)
  }

  // Clear canvas
  const clear = useCallback(() => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Reset history
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([initialState])
    setHistoryIndex(0)
    setHasSignatureState(false)
    onSignatureChange?.(false)
  }, [disabled, onSignatureChange])

  // Get signature as data URL (PNG)
  const getSignatureDataUrl = useCallback((): string | null => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignatureState) return null

    return canvas.toDataURL('image/png')
  }, [hasSignatureState])

  // Get signature as Blob
  const getSignatureBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current
      if (!canvas || !hasSignatureState) {
        resolve(null)
        return
      }

      canvas.toBlob((blob) => {
        resolve(blob)
      }, 'image/png')
    })
  }, [hasSignatureState])

  // Expose methods to parent via imperative handle
  useImperativeHandle(ref, () => ({
    getSignatureDataUrl,
    getSignatureBlob,
    clear,
    hasSignature: () => hasSignatureState
  }), [getSignatureDataUrl, getSignatureBlob, clear, hasSignatureState])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="relative rounded-lg border bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className={cn(
            'w-full cursor-crosshair touch-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            maxWidth: '100%',
            aspectRatio: `${width}/${height}`
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignatureState && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-muted-foreground">
              Sign here
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Draw your signature above
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={disabled || historyIndex <= 0}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clear}
            disabled={disabled || !hasSignatureState}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

SignatureCanvas.displayName = 'SignatureCanvas'
