import React, { useContext, useEffect, useMemo, useState } from "react";
import Popup from "./Popup";
import RegisterAppointment from "./RegisterAppointment";
import ViewAppointment from "./ViewAppointment";
import DateTimeContext from "../context/DateTimeContext";
import SidebarContext from "../context/SidebarContext";
import { FaSpinner } from "react-icons/fa";
import ThemeContext from "../context/ThemeContext";

const Scheduler = ({ date }) => {
  const { theme } = useContext(ThemeContext);
  const { shopId } = useContext(SidebarContext);
  const { setDateTime } = useContext(DateTimeContext);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelState, setModelState] = useState(false);
  const [registerModelState, setRegisterModelState] = useState(false);
  const [updateModelState, setUpdateModelState] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");

  const token = localStorage.getItem("ag_app_shop_token");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4040/appointments?shop=${shopId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      setAppointmentsList(data.appointments);
      console.log(appointmentsList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [shopId]);

  const hoursArr = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= 9; i++) {
      let d = i + 8;
      let d1 = new Date(date);
      d1.setHours(d);
      d1.setMinutes(0);
      d1.setSeconds(0);
      let d2 = new Date(d1);
      d2.setMinutes(30);

      if (i === 9) {
        arr.push(d1);
      } else {
        arr.push(d1, d2);
      }
    }
    return arr;
  }, [date]);

  function handleAppointment(hour) {
    const now = new Date();
    const nextAppointment = new Date(hour.getTime() + 30 * 60000);

    if (hour.getTime() < now.getTime()) {
      alert("Sorry, this appointment has passed. Please choose another time.");
    } else if (nextAppointment.getTime() <= now.getTime()) {
      alert(
        "Sorry, you cannot choose this appointment as it is less than 30 minutes from the next appointment."
      );
    } else {
      setDateTime(hour);
      setModelState(true);
    }
  }

  // Today's Date formatted
  const today = useMemo(() => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Date(date).toLocaleDateString("en-US", options);
    return formattedDate;
  }, [date]);

  return (
    <div className="flex justify-center items-center h-full pb-4">
      <div className="bg-gray-200 w-full lg:w-4/5 xl:w-3/4 pb-4">
        <h1 className={`text-3xl text-center text-gray-800 py-8 font-medium`}>
          Schedule an Appointment
        </h1>

        <div className="flex items-center justify-between mb-4 mx-4">
          <h2 className={`text-xl font-medium text-gray-800`}>
            {date.toDateString()}
          </h2>
          <button
            className={`text-gray-600 hover:text-gray-800 font-semibold text-sm`}
            onClick={() => fetchAppointments()}
          >
            {loading ? <FaSpinner className="animate-spin" /> : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mx-4">
          {hoursArr.map((hour, index) => {
            const appointment = appointmentsList.find(
              (appt) => new Date(appt.dateTime).toString() === hour.toString()
            );

            // Calculate the total duration of the previous appointment's services
            // let prevAppointmentDuration = 0;
            // if (index > 0) {
            //   const prevAppointment = appointmentsList[index - 1];
            //   if (prevAppointment) {
            //     prevAppointmentDuration = prevAppointment.service.reduce(
            //       (totalDuration, service) => totalDuration + service.duration,
            //       0
            //     );
            //   }
            // }

            // console.log("prevAppointmentDuration: " + prevAppointmentDuration);

            // ||
            // prevAppointmentDuration > 30; // Disable if previous appointment's total service duration exceeds 30 minutes (30 minutes = 1800000 milliseconds)
            const isDisabled =
              hour < new Date() ||
              (appointment !== undefined &&
                appointment.dateTime - hour.getTime() < 1800000);

            const customerName = appointment?.customer?.name;
            const professionalName = appointment?.professional?.name;
            const serviceNames =
              appointment?.service?.map((ser) => ser.name).join(", ") || "";

            return (
              <div
                key={index}
                onClick={() =>
                  !isDisabled && !appointment && handleAppointment(hour)
                }
                className={`${
                  isDisabled
                    ? `bg-gray-500 rounded-lg shadow-md p-4 cursor-not-allowed line-through text-white`
                    : `bg-gray-700 rounded-lg shadow-md hover:shadow-lg p-4 cursor-pointer text-white`
                }`}
              >
                <p className={`text-xl text-gray-100`}>
                  {hour.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {appointment && (
                  <button
                    className={`${
                      isDisabled
                        ? `text-sm text-gray-100`
                        : `text-sm text-gray-100 hover:text-gray-800`
                    }`}
                    onClick={() => {
                      setSelectedAppointmentId(appointment._id);
                      setUpdateModelState(true);
                    }}
                    disabled={isDisabled}
                  >
                    <span>{`Reserved for `}</span>
                    <span className="font-bold">{`${customerName}`}</span>
                    <span>{` with `}</span>
                    <span className="font-semibold">{professionalName}</span>
                    <span>{`, Services: `}</span>
                    <span className="italic">{serviceNames}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Popup
          isOpen={modelState}
          onClose={() => setModelState(!modelState)}
          children={<RegisterAppointment setModelState={setModelState} />}
        />

        <Popup
          isOpen={updateModelState}
          onClose={() => setUpdateModelState(!updateModelState)}
          children={
            <ViewAppointment
              setModelState={setUpdateModelState}
              appointmentId={selectedAppointmentId}
            />
          }
        />
      </div>
    </div>
  );
};

export default Scheduler;
