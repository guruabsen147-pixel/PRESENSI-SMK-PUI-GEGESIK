import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertTriangle, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User, School } from '../types';

interface SelfieCameraProps {
  user: User;
  school: School;
  currentLat: number | null;
  currentLng: number | null;
  distanceMeters: number;
  isWithinRadius: boolean;
  onCapture: (photoBase64: string) => void;
  onCancel?: () => void;
}

export const SelfieCamera: React.FC<SelfieCameraProps> = ({
  user,
  school,
  currentLat,
  currentLng,
  distanceMeters,
  isWithinRadius,
  onCapture,
  onCancel
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      setCameraError(null);
      setIsReady(false);
      try {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsReady(true);
          };
        }
      } catch (err: any) {
        console.warn('Camera stream permission or device error:', err);
        setCameraError(
          err.name === 'NotAllowedError'
            ? 'Izin akses kamera ditolak. Silakan izinkan kamera di browser atau gunakan mode unggah foto selfie.'
            : 'Kamera tidak terdeteksi atau sedang digunakan aplikasi lain.'
        );
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  // Stamp watermark onto canvas and generate high-contrast proof photo
  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 640;
    canvas.width = width;
    canvas.height = height;

    // Draw raw video frame
    // If facing user, mirror horizontally for natural selfie view
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    } else {
      ctx.drawImage(video, 0, 0, width, height);
    }

    // Draw Watermark Overlay Banner (Bottom)
    const bannerHeight = 110;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'; // slate-900 with opacity
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Accent line
    ctx.fillStyle = isWithinRadius ? '#10b981' : '#f59e0b';
    ctx.fillRect(0, height - bannerHeight, width, 4);

    // Text Watermarks
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour12: false }) + ' WIB';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${user.name}`, 16, height - bannerHeight + 28);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`NIP: ${user.nip} • ${school.name}`, 16, height - bannerHeight + 48);

    ctx.fillStyle = '#38bdf8'; // sky blue
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`⏰ ${dateFormatted} | ${timeFormatted}`, 16, height - bannerHeight + 70);

    const latStr = currentLat ? currentLat.toFixed(5) : '0.00000';
    const lngStr = currentLng ? currentLng.toFixed(5) : '0.00000';
    const radiusStr = isWithinRadius ? `[✓ VALID RADIUS (${distanceMeters}m)]` : `[! LUAR RADIUS (${distanceMeters}m)]`;

    ctx.fillStyle = isWithinRadius ? '#4ade80' : '#fcd34d';
    ctx.font = '12px sans-serif';
    ctx.fillText(`📍 GPS: ${latStr}, ${lngStr} • ${radiusStr}`, 16, height - bannerHeight + 92);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedPhoto(photoDataUrl);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
    }
  };

  // Fallback file upload if camera is not available
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          if (!canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          const width = 640;
          const height = 640;
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Overlay watermark
          const bannerHeight = 110;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
          ctx.fillRect(0, height - bannerHeight, width, bannerHeight);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(0, height - bannerHeight, width, 4);

          const now = new Date();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(`${user.name}`, 16, height - bannerHeight + 28);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '13px sans-serif';
          ctx.fillText(`NIP: ${user.nip} • ${school.name}`, 16, height - bannerHeight + 48);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 14px monospace';
          ctx.fillText(`⏰ ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID')} WIB`, 16, height - bannerHeight + 70);
          ctx.fillStyle = '#4ade80';
          ctx.font = '12px sans-serif';
          ctx.fillText(`📍 GPS Verifikasi: ${currentLat?.toFixed(5) || 0}, ${currentLng?.toFixed(5) || 0} (${distanceMeters}m)`, 16, height - bannerHeight + 92);

          const stampedUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCapturedPhoto(stampedUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="selfie-camera-container" className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl max-w-md mx-auto relative overflow-hidden border border-slate-800">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="font-semibold text-sm tracking-wide">Verifikasi Selfie & Lokasi Real-time</span>
        </div>
        {!capturedPhoto && !cameraError && (
          <button
            id="btn-switch-camera"
            type="button"
            onClick={toggleCamera}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
            title="Ganti Kamera Depan/Belakang"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Balik</span>
          </button>
        )}
      </div>

      {/* Main Viewport */}
      {!capturedPhoto ? (
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-slate-800">
          {!cameraError ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Face Frame Guide Oval */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
                <div className="w-48 h-60 border-2 border-dashed border-emerald-400/70 rounded-[50%] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <span className="text-[11px] font-medium bg-slate-900/80 px-2 py-0.5 rounded-full text-emerald-300">
                    Posisikan Wajah Disini
                  </span>
                </div>
              </div>

              {/* Real-time GPS badge overlay */}
              <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none">
                <div className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 ${
                  isWithinRadius ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isWithinRadius ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isWithinRadius ? `Dalam Radius (${distanceMeters}m)` : `Di Luar Radius (${distanceMeters}m)`}
                </div>
                <div className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-900/80 text-slate-300">
                  {school.name.split(' ')[0]}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3">
              <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300">{cameraError}</p>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-medium cursor-pointer text-white">
                  <UserIcon className="w-4 h-4" />
                  <span>Pilih Foto dari Galeri/Kamera</span>
                  <input type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Snapshot Preview View */
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border-2 border-emerald-500">
          <img src={capturedPhoto} alt="Hasil Foto Presensi" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Watermark GPS Tersemat</span>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="mt-4 flex items-center justify-between gap-3">
        {!capturedPhoto ? (
          <>
            {onCancel && (
              <button
                id="btn-cancel-camera"
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Batal
              </button>
            )}
            <button
              id="btn-take-selfie"
              type="button"
              onClick={takeSnapshot}
              disabled={!isReady && !cameraError}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition active:scale-95 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              <span>Ambil Foto Selfie Presensi</span>
            </button>
          </>
        ) : (
          <>
            <button
              id="btn-retake-selfie"
              type="button"
              onClick={handleRetake}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Foto Ulang</span>
            </button>
            <button
              id="btn-confirm-selfie"
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/50 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan & Lanjutkan</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
