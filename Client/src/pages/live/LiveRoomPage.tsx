import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { joinLiveSession, endLiveSession } from "@/api/liveSessionApi";
import { Loader2, AlertCircle, ArrowLeft, Power } from "lucide-react";
import { useAuth } from "@/hooks";

// LiveKit server URL from environment variables
const serverUrl = import.meta.env.VITE_LIVEKIT_URL;

export default function LiveRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isEnding, setIsEnding] = useState(false);

  const isTeacher = user?.role === "TEACHER";

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const fetchToken = async () => {
      try {
        const data = await joinLiveSession(sessionId);
        setToken(data.token);
      } catch (err: unknown) {
        const errorMessage =
          typeof err === "object" && err !== null && "response" in err
            ? (err as { response: { data: { message: string } } }).response
                ?.data?.message
            : "Không thể tham gia phòng. Vui lòng kiểm tra quyền truy cập.";
        setError(errorMessage);
      }
    };

    fetchToken();
  }, [sessionId]);

  const handleEndSession = async () => {
    if (
      !sessionId ||
      !globalThis.confirm(
        "Bạn có chắc muốn kết thúc buổi học này cho tất cả mọi người?",
      )
    ) {
      return;
    }

    setIsEnding(true);
    try {
      await endLiveSession(sessionId);
      navigate("/instructor/live");
    } catch (err) {
      console.error("End session error:", err);
      alert("Không thể kết thúc buổi học. Vui lòng thử lại.");
      setIsEnding(false);
    }
  };

  const handleBackHomePage = () => {
    window.close();
  };

  if (!sessionId) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Lỗi kết nối</h2>
        <p className="text-slate-500 mb-6">Không tìm thấy ID phòng.</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <ArrowLeft size={18} /> Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Lỗi kết nối</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={handleBackHomePage}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <ArrowLeft size={18} /> Quay lại trang chủ
        </button>
      </div>
    );
  }

  if (token === "") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-600 animate-pulse font-medium">
          Đang chuẩn bị vào phòng...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#111]">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        // Use the default VideoConference component, which is a complete UI
        // Or construct custom UI
        data-lk-theme="default"
        style={{ height: "100vh" }}
        onDisconnected={() => {
          window.close();
        }}
      >
        {/* Adds standard video grid and controls */}
        <VideoConference />
        {/* The RoomAudioRenderer component is required to play audio */}
        <RoomAudioRenderer />

        {/* Custom End Session button for Teacher */}
        {isTeacher && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleEndSession}
              disabled={isEnding}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition shadow-lg disabled:opacity-50"
            >
              <Power size={18} />
              {isEnding ? "Đang kết thúc..." : "Kết thúc buổi học"}
            </button>
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
}
