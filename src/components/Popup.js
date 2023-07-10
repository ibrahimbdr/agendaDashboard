import React from "react";

const Popup = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed z-10 inset-0 w-fit mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div
              className="fixed inset-0 bg-gray-500 opacity-75"
              onClick={onClose}
            ></div>
            <div className="bg-white rounded-lg overflow-hidden shadow-xl relative">
              <button
                className="absolute top-0 right-0 m-3 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={onClose}
              >
                <svg
                  className="h-6 w-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className="heroicon-ui"
                    d="M6.7 6.7a1 1 0 011.4 0L12 10.6l3.9-3.9a1 1 0 111.4 1.4L13.4 12l3.9 3.9a1 1 0 01-1.4 1.4L12 13.4l-3.9 3.9a1 1 0 01-1.4-1.4L10.6 12 6.7 8.1a1 1 0 010-1.4z"
                  />
                </svg>
              </button>
              <div className="px-4 py-6">{children}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Popup;
