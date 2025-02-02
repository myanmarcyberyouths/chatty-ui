import React, { useState , useEffect } from "react";
import axios from "axios";

const StickerPicker = ({ onSelectSticker, onClose }) => {

  const [stickers, setStickers] = useState([]);  // State to store stickers
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/auth'

  useEffect(() => {
    axios.get(`${API_BASE_URL}/stickers`)
      .then((res) => {
        setStickers(res.data.data);  // Assuming res.data has a "data" field
      })
      .catch((error) => console.log(error));
  }, []);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-5 w-80 max-h-[80vh] relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4 text-center">Sticker Package</h3>

        {/* Scrollable sticker container */}
        <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
          {stickers.length > 0 ? (
            stickers.map((sticker) => (
              <img
                key={sticker._id}
                src={`${import.meta.env.VITE_BACKEND_URL}/${sticker.file_path}`}
                alt="sticker"
                className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
                onClick={() => onSelectSticker(sticker.file_path)}
              />
            ))
          ) : (
              <p className="text-center col-span-3 text-gray-500">...</p>
            )}
        </div>
      </div>
    </div>
  );
};

export { StickerPicker }
