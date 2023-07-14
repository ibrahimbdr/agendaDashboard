import React, { useContext, useEffect, useState } from "react";
import DateTimeContext from "../context/DateTimeContext";
import axios from "axios";
import SidebarContext from "../context/SidebarContext";
import { FaSpinner, FaCheck } from "react-icons/fa";

const ViewAppointment = ({ setModelState, appointmentId }) => {
  const { shopId } = useContext(SidebarContext);
  const token = localStorage.getItem("ag_app_shop_token");
  const [dateTime, setDateTime] = useState(new Date());
  const [appointmentData, setAppointmentData] = useState(null);

  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/appointments/${appointmentId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setAppointmentData(response.data.appointment);
        console.log(response.data.appointment);
        setDateTime(new Date(response.data.appointment.dateTime));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Appointment Details</h2>
      {appointmentData ? (
        <div className="bg-white rounded-lg p-6 mb-4 overflow-y-auto min-w-[350px] sm:min-w-[500px] mx-auto">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Customer:
            </label>
            <p className="text-gray-900">{appointmentData.customer.name}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Professional:
            </label>
            <p className="text-gray-900">{appointmentData.professional.name}</p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Services:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {appointmentData.service.map((service) => (
                <div key={service._id} className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                  <span className="text-sm text-gray-900">{service.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-gray-500 font-semibold">
              {new Intl.DateTimeFormat("en", {
                timeStyle: "short",
              }).format(dateTime)}
            </p>
            <p className="text-sm text-gray-500 font-semibold">
              {new Intl.DateTimeFormat(["ban", "id"]).format(dateTime)}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[368px]">
          <div className="flex flex-col items-center space-y-2">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="text-gray-700">Loading...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAppointment;
