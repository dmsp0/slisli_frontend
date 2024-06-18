import React from "react";

const Modal = ({ showModal, message, onConfirm, onCancel, showCancel = true }) => {
  if (!showModal) return null;

  return (
    <div className="w-lvw h-lvh z-10 fixed top-0 left-0 bg-black/40">
      <div className="absolute bg-white top-1/2 left-1/2 w-[320px] h-[120px] z-100 -translate-x-1/2 -translate-y-1/2 rounded-lg shadow">
        <div className="flex flex-col justify-center h-full p-3">
          <div className="text-center w-full h-2/3 mb-2 flex justify-center items-center">
            {message}
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="border py-2 px-5 rounded-md bg-blue-500 text-white"
              onClick={onConfirm}
            >
              확인
            </button>
            {showCancel && (
              <button
                className="border py-2 px-5 rounded-md bg-red-500 text-white"
                onClick={onCancel}
              >
                취소
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
