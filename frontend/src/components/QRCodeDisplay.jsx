import { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeDisplay({ value, size = 160 }) {
  const [dataUrl, setDataUrl] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
    }).then(() => {
      if (canvasRef.current) setDataUrl(canvasRef.current.toDataURL())
    }).catch(() => {})
  }, [value, size])

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="rounded-lg border border-neutral-200" />
      {dataUrl && (
        <a href={dataUrl} download="booking-qr.png" className="mt-2 text-xs text-primary-600 hover:underline">
          Download QR
        </a>
      )}
    </div>
  )
}
