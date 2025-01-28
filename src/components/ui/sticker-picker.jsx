import React, { useState } from "react";

const StickerPicker = ({ onSelectSticker, onClose }) => {

  const stickerCategories= {
    months: [
    "uploads/stickers/august.png",
    "uploads/stickers/july.png",
    "uploads/stickers/june.png",
  ],
    love: [
    "uploads/stickers/love-song.png",
    "uploads/stickers/pu.png",
    "uploads/stickers/cassette-tape.png",
  ]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-5 w-80 max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-bold mb-4 text-center">Pick a Sticker</h3>
        <div className="space-y-6">
          {Object.entries(stickerCategories).map(([category, stickers]) => (
            <div key={category}>
              <h4 className="text-md font-semibold mb-2">{category}</h4>
              <div className="grid grid-cols-3 gap-2">
                {stickers.map((sticker, index) => (
                  <img
                    key={index}
                    src={`${import.meta.env.VITE_BACKEND_URL}/${sticker}`}
                    alt="sticker"
                    className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => onSelectSticker(sticker)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { StickerPicker }
