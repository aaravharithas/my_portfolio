import React from "react";

export default function SoftBlobsBackground() {
  return (
    <>
      <div className="soft-blobs-bg">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <style>{`
        .soft-blobs-bg {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          width: 420px;
          height: 420px;
          background: rgba(255, 255, 255, 0.09);
          border-radius: 45%;
          filter: blur(60px);
          animation: floatBlobs 18s infinite ease-in-out alternate,
                     blobMorph 22s infinite ease-in-out alternate;
          backdrop-filter: blur(18px);
          will-change: transform;
          box-shadow: 0 0 120px rgba(250,204,21,0.45);
        }

        .blob1 {
          top: -120px;
          left: -90px;
        }

        .blob2 {
          bottom: -140px;
          right: -120px;
          background: rgba(250, 204, 21, 0.16);
        }

        .blob3 {
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: rgba(255,255,255,0.06);
        }

        @keyframes floatBlobs {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(60px, -40px) scale(1.15); }
        }

        @keyframes blobMorph {
          0% { border-radius: 45% 55% 50% 50%; }
          25% { border-radius: 60% 40% 55% 45%; }
          50% { border-radius: 50% 50% 60% 40%; }
          75% { border-radius: 55% 45% 40% 60%; }
          100% { border-radius: 45% 55% 50% 50%; }
        }

        /* RESPONSIVE BLOBS */
        @media (max-width: 768px) {
          .blob {
            width: 300px;
            height: 300px;
            filter: blur(40px);
          }

          .blob3 {
            width: 360px;
            height: 360px;
          }
        }
      `}</style>
    </>
  );
}
