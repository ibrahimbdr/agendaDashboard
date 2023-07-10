import React, { useEffect } from "react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { IoIosCloseCircleOutline } from "react-icons/io";

const Alert = ({ message, type, setBooked }) => {
  const alertTypes = {
    success: {
      icon: <AiOutlineCheckCircle className="text-green-500" />,
      bgColor: "bg-green-100",
      textColor: "text-green-900",
    },
    error: {
      icon: <IoIosCloseCircleOutline className="text-red-500" />,
      bgColor: "bg-red-100",
      textColor: "text-red-900",
    },
  };

  const { icon, bgColor, textColor } = alertTypes[type] || alertTypes.success;

  useEffect(() => {
    const timer = setTimeout(() => {
      setBooked(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [setBooked]);

  const handleClose = () => {
    setBooked(false);
  };

  return (
    <div className="fixed left-0 top-1 z-40 w-screen px-2">
      <div
        className={`flex items-center justify-between px-4 py-2 space-x-2 ${bgColor} ${textColor} rounded-lg shadow-lg`}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm">{message}</span>
        </div>
        <button
          className="text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={handleClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Alert;
