import React, { useMemo, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import SidebarContext from "../context/SidebarContext";
import Popup from "./Popup";
import ViewAppointment from "./ViewAppointment";
import DateTimeContext from "../context/DateTimeContext";
import ViewModeContext from "../context/ViewModeContext";
import ProcessAppointment from "./ProcessAppointment";
import ProfessionalIdContext from "../context/ProfessionalIdContext";
import stripeBackground from "../images/stripe.svg";
import stripeBackground2 from "../images/stripe2.svg";
import UpdateAppointment from "./UpdateAppointment";

const schedulerData = [];

const SchedulerC = ({
  date,
  startWeekDate,
  workingHours,
  onSelectedDateChange,
  onSelectedWeekDateChange,
  selectedProfessional,
  selectedProfessionals,
  setBooked,
  setAlertMsg,
  setAlertMsgType,
}) => {
  const { shopId } = React.useContext(SidebarContext);
  const { setDateTime } = React.useContext(DateTimeContext);
  const { setProfessionalId } = React.useContext(ProfessionalIdContext);
  const [selectedDate, setSelectedDate] = React.useState(date);
  const [selectedWeekDate, setSelectedWeekDate] = React.useState(startWeekDate);
  const { viewMode, setViewMode } = React.useContext(ViewModeContext);
  const [appointmentsList, setAppointmentsList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [modelState, setModelState] = React.useState(false);
  const [registerModelState, setRegisterModelState] = React.useState(false);
  const [updateModelState, setUpdateModelState] = React.useState(false);
  const [viewModelState, setViewModelState] = React.useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = React.useState("");
  const [appointmentsObject, setAppointmentsObject] = React.useState(null);
  const token = localStorage.getItem("ag_app_shop_token");

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4040/appointments?shopId=${shopId}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
          },
        }
      );
      const data = await response.json();
      setAppointmentsList(data.appointments);
      const appointmentsObject = data.appointments.reduce(
        (acc, appointment) => {
          const professionalId = appointment.professional._id;

          if (!acc[professionalId]) {
            acc[professionalId] = [];
          }

          acc[professionalId].push(appointment);

          return acc;
        },
        {}
      );
      setAppointmentsObject(appointmentsObject);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAppointments();
  }, [shopId, modelState, updateModelState]);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  function handleAppointment(hour, professionalId) {
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
      setProfessionalId(professionalId);
      setModelState(true);
    }
  }

  console.log(workingHours);

  const hoursArrs = useMemo(() => {
    const arr = [];
    if (workingHours && workingHours.length > 0) {
      for (let i = 0; i < workingHours.length; i++) {
        const range = [];
        const { startHour, endHour } = workingHours[i];
        for (let hour = startHour; hour <= endHour; hour++) {
          let d = hour;
          let d1 = new Date(date);
          d1.setHours(d);
          d1.setMinutes(0);
          d1.setSeconds(0);

          range.push(d1);
        }
        arr.push(range);
      }
    } else {
      const range = [];
      for (let i = 1; i <= 10; i++) {
        let d = i + 7;
        let d1 = new Date(date);
        d1.setHours(d);
        d1.setMinutes(0);
        d1.setSeconds(0);

        range.push(d1);
      }
      arr.push(range);
    }
    return arr;
  }, [date, workingHours]);

  const hoursArrsWeek = useMemo(() => {
    const arr = [];
    if (workingHours && workingHours.length > 0) {
      for (let i = 0; i < workingHours.length; i++) {
        const range = [];
        const { startHour, endHour } = workingHours[i];
        for (let hour = startHour; hour <= endHour; hour++) {
          let d = hour;
          let d1 = new Date(startWeekDate);
          d1.setHours(d);
          d1.setMinutes(0);
          d1.setSeconds(0);

          range.push(d1);
        }
        arr.push(range);
      }
    } else {
      const range = [];
      for (let i = 1; i <= 10; i++) {
        let d = i + 7;
        let d1 = new Date(startWeekDate);
        d1.setHours(d);
        d1.setMinutes(0);
        d1.setSeconds(0);

        range.push(d1);
      }
      arr.push(range);
    }
    return arr;
  }, [startWeekDate, workingHours]);

  console.log(hoursArrsWeek);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatDateShort = (date) => {
    const options = {
      month: "numeric",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatDateWithWeekShort = (date) => {
    const options = {
      weekday: "short",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const formatDateWithDayMonthShort = (date) => {
    const options = {
      month: "numeric",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const getDateWithOffset = (startDate, offset) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + offset);
    return date;
  };

  const handleExistingAppointment = (appt) => {
    setSelectedAppointmentId(appt._id);
    if (new Date(appt.dateTime) > new Date()) {
      setUpdateModelState(true);
    } else {
      setViewModelState(true);
    }
  };

  const renderTabs = () => {
    return (
      <div className="flex items-center">
        <div className="w-16">
          <button
            className={`px-2 py-1 text-sm rounded-md ${viewMode === "daily" ? "bg-gray-800 text-white" : "text-gray-700"
              }`}
            onClick={() => setViewMode("daily")}
          >
            Daily
          </button>
        </div>
        <div className="w-16">
          <button
            className={`px-2 py-1 text-sm rounded-md ${viewMode === "weekly" ? "bg-gray-800 text-white" : "text-gray-700"
              }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
        </div>
      </div>
    );
  };

  const handlePreviousDate = () => {
    const prevDate = getDateWithOffset(selectedDate, -1);
    setSelectedDate(prevDate);
    onSelectedDateChange(prevDate); // Call the callback function to update the date in the Agenda component
  };

  const handleNextDate = () => {
    const nextDate = getDateWithOffset(selectedDate, 1);
    setSelectedDate(nextDate);
    onSelectedDateChange(nextDate); // Call the callback function to update the date in the Agenda component
  };

  const handlePreviousWeekDate = () => {
    const prevWeekDate = getDateWithOffset(selectedWeekDate, -7);
    setSelectedWeekDate(prevWeekDate);
    onSelectedWeekDateChange(prevWeekDate); // Call the callback function to update the date in the Agenda component
  };

  const handleNextWeekDate = () => {
    const nextWeekDate = getDateWithOffset(selectedWeekDate, 7);
    setSelectedWeekDate(nextWeekDate);
    onSelectedWeekDateChange(nextWeekDate); // Call the callback function to update the date in the Agenda component
  };

  // const renderDailyView = () => {
  //   // Daily view rendering logic
  //   // You can use the existing renderTimeSlots() function for this
  //   return renderTimeSlots();
  // };

  const getStartOfWeek = (date) => {
    const startOfWeek = new Date(date);
    const diff =
      startOfWeek.getDate() -
      startOfWeek.getDay() +
      (startOfWeek.getDay() === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const renderWeeklyView = (hoursArrWeekPeriod, ind) => {
    const weekdays = [];
    const currentDate = new Date(startWeekDate);
    const startOfWeek = getStartOfWeek(currentDate);
    const slotWidth = `min-w-[135px] md:w-[100%]`;

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      weekdays.push(currentDay);
    }

    const timeSlots = [];

    timeSlots.push(
      <div
        key="title"
        className={`flex items-center relative ${ind === 0 ? "border-b" : "border-b-4"
          } border-gray-400 ps-10 min-w-[989px]`}
      >
        {ind === 0 &&
          weekdays.map((weekday, index) => (
            <div className={`${slotWidth} py-4`} key={index}>
              <h5 className="text-center">
                {formatDateWithWeekShort(weekday)}
              </h5>
              <h5 className="text-center">
                {formatDateWithDayMonthShort(weekday)}
              </h5>
            </div>
          ))}
      </div>
    );

    let prevEndDateTime = Array(weekdays.length).fill(null);
    let prevBlocking = Array(weekdays.length).fill(null);
    hoursArrWeekPeriod.map((hour, hourIndex) => {
      timeSlots.push(
        <div key={hour} className="flex items-center">
          <div className="w-11 text-center">
            <div className="w-11 text-sm">
              {hour.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          {weekdays.map((weekday, dayIndex) => {
            return (
              <div className={`${slotWidth}`} key={dayIndex}>
                <div className="flex-grow">
                  <div
                    className={`flex flex-col ${dayIndex !== 6
                        ? "border-l border-gray-400"
                        : "border-x border-gray-400"
                      }`}
                  >
                    {Array.from({ length: 4 }).map((_, index) => {
                      const startDateTime = new Date(weekday);
                      startDateTime.setHours(hour.getHours());
                      startDateTime.setMinutes(hour.getMinutes());
                      startDateTime.setMinutes(index * 15);

                      // const appointment = appointmentsList.find(
                      //   (appt) =>
                      //     new Date(appt.dateTime).toString() ===
                      //     startDateTime.toString()
                      // );

                      const appointment = appointmentsList.find((appt) => {
                        const isDateTimeMatch =
                          new Date(appt.dateTime).toString() ===
                          startDateTime.toString();
                        const isProfessionalIdMatch =
                          appt.professional._id === selectedProfessional._id;
                        return isDateTimeMatch && isProfessionalIdMatch;
                      });

                      const isDisabled =
                        startDateTime < new Date() ||
                        (appointment !== undefined &&
                          appointment.dateTime - startDateTime.getTime() <
                          1800000) ||
                        (selectedProfessional?.officeHours !== undefined &&
                          selectedProfessional.officeHours.every(
                            (officeHour) => {
                              return (
                                startDateTime.getHours() <
                                officeHour.startHour ||
                                startDateTime.getHours() > officeHour.endHour
                              );
                            }
                          ));

                      const customerName = appointment?.customer?.name;
                      const professionalName = appointment?.professional?.name;
                      const serviceNames =
                        appointment?.service?.map((s) => s.name).join(", ") ||
                        "";

                      const duration =
                        appointment?.duration ||
                        appointment?.service?.reduce(
                          (totalDuration, s) => totalDuration + s.duration,
                          0
                        );

                      const blockingDuration = appointment?.blockingDuration;

                      const endDateTime = new Date(startDateTime);
                      endDateTime.setMinutes(
                        startDateTime.getMinutes() + duration
                      );

                      if (appointment?.blocking) {
                        endDateTime.setMinutes(
                          startDateTime.getMinutes() + blockingDuration
                        );
                      }

                      // Check if previous endDateTime is greater than the current startTime
                      const isPrevEndGreater =
                        prevEndDateTime[dayIndex] > startDateTime;

                      // Update prevEndDateTime if necessary
                      if (endDateTime > prevEndDateTime[dayIndex]) {
                        prevEndDateTime[dayIndex] = endDateTime;
                      }
                      // Add condition to set gray background and disable slot
                      if (isPrevEndGreater) {
                        if (prevBlocking[dayIndex]) {
                          return (
                            <div
                              key={index}
                              className={`h-6 z-10 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed`}
                              style={{ backgroundColor: "#AD8C8C" }}
                              disabled
                            ></div>
                          );
                        }
                        return (
                          <div
                            key={index}
                            className={`h-6 bg-gray-800 p-1
                      ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                      cursor-pointer  text-white font-medium text-xs flex items-center justify-center`}
                            disabled={isDisabled}
                          ></div>
                        );
                      }

                      if (appointment) {
                        if (appointment?.blocking) {
                          prevBlocking[dayIndex] = true;
                          return (
                            <div
                              key={index}
                              className={`h-6 z-10 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed`}
                              style={{ backgroundColor: "#AD8C8C" }}
                              disabled
                            >
                              <span className="font-extrabold text-white ml-1 truncate">
                                {appointment?.blockingReason}
                              </span>
                            </div>
                          );
                        } else {
                          prevBlocking[dayIndex] = false;
                        }
                        return (
                          <div
                            key={index}
                            className={`h-6 bg-gray-800 z-10 p-1 cursor-pointer text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            onClick={() =>
                              handleExistingAppointment(appointment)
                            }
                            disabled={isDisabled}
                          >
                            <span className="font-bold text-white mr-1 whitespace-nowrap">
                              {customerName}
                            </span>
                            <span className="text-gray-300">Services:</span>
                            <span className="italic text-white ml-1 truncate">
                              {serviceNames}
                            </span>
                          </div>
                        );
                      }

                      if (!isDisabled && !appointment) {
                        return (
                          <div
                            key={index}
                            className={`h-6 bg-gray-200 p-1 ${index !== 3 &&
                              "border-b border-dotted border-gray-400"
                              } cursor-crosshair hover:bg-gray-300`}
                            onClick={() =>
                              !isDisabled &&
                              !appointment &&
                              handleAppointment(
                                startDateTime,
                                selectedProfessional
                              )
                            }
                          ></div>
                        );
                      } else {
                        return (
                          <div
                            key={index}
                            className="h-6 z-10 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed"
                            disabled
                            style={{
                              backgroundImage: `url(${stripeBackground})`,
                              backgroundRepeat: "repeat",
                            }}
                          ></div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );

      // Add separator between hours
      if (hour.getHours() !== 17) {
        timeSlots.push(
          <div
            key={`separator-${hour}`}
            className="h-px bg-gray-400 min-w-[989px]"
          ></div>
        );
      }
    });

    return timeSlots;
  };

  const renderDailyView = (hoursArr, ind) => {
    const timeSlots = [];
    const numProfessionals = selectedProfessionals.length;
    const slotWidth = `min-w-[135px] md:w-[100%]`;
    timeSlots.push(
      <div
        key="title"
        className={`flex items-center ps-10 border-b border-gray-400 min-w-[${numProfessionals * 135 + 44
          }px]`}
      >
        {ind === 0 &&
          selectedProfessionals.map((pro, index) => (
            <div
              className={`${slotWidth} flex justify-center items-center py-4`}
              key={index}
            >
              <FaUserCircle size={30} className="text-gray-400 mr-1" />
              <h1>{pro.name}</h1>
            </div>
          ))}
      </div>
    );

    let prevEndDateTime = Array(selectedProfessionals.length).fill(null);
    let professionalsId = Array(selectedProfessionals.length).fill(null);
    let appointmentBlocking = Array(selectedProfessionals.length).fill(false);
    let professionalsAppt = Array(selectedProfessionals.length).fill(null);

    hoursArr.map((hour, hourIndex) => {
      timeSlots.push(
        <div key={hour} className="flex items-center w-full">
          <div className="w-11 text-center">
            <div className="text-sm w-11 ">
              {hour.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          {selectedProfessionals.map((pro, proIndex) => {
            return (
              <div className={`${slotWidth}`} key={proIndex}>
                <div className="flex-grow">
                  <div
                    className={`flex flex-col w-full
                    ${proIndex !== numProfessionals - 1
                        ? "border-l border-gray-400"
                        : "border-x border-gray-400"
                      }
                    `}
                  >
                    {Array.from({ length: 4 }).map((_, index) => {
                      const startDateTime = new Date(hour);
                      startDateTime.setMinutes(index * 15);

                      const appointment = appointmentsList.find((appt) => {
                        const isDateTimeMatch =
                          new Date(appt.dateTime).toString() ===
                          startDateTime.toString();
                        const isProfessionalIdMatch =
                          appt.professional._id === pro._id;
                        return isDateTimeMatch && isProfessionalIdMatch;
                      });

                      let professionalAppointmnets = [];

                      if (
                        appointmentsObject &&
                        appointmentsObject.hasOwnProperty(pro._id)
                      ) {
                        professionalAppointmnets = appointmentsObject[pro._id];
                      }

                      let appointmentIndex = 0;
                      if (
                        professionalAppointmnets !== undefined &&
                        appointment !== undefined
                      ) {
                        appointmentIndex = professionalAppointmnets.findIndex(
                          (appt) => appt._id === appointment._id
                        );
                      }

                      const isDisabled =
                        startDateTime < new Date() ||
                        (appointment !== undefined &&
                          appointment.dateTime - startDateTime.getTime() <
                          1800000) ||
                        (pro?.officeHours !== undefined &&
                          pro.officeHours.every((officeHour) => {
                            return (
                              startDateTime.getHours() < officeHour.startHour ||
                              startDateTime.getHours() > officeHour.endHour
                            );
                          }));

                      const customerName = appointment?.customer?.name;
                      const professionalName = appointment?.professional?.name;
                      const serviceNames =
                        appointment?.service?.map((s) => s.name).join(", ") ||
                        "";

                      const duration =
                        appointment?.duration ||
                        appointment?.service?.reduce(
                          (totalDuration, s) => totalDuration + s.duration,
                          0
                        );

                      const blockingDuration = appointment?.blockingDuration;

                      const endDateTime = new Date(startDateTime);

                      endDateTime.setMinutes(
                        startDateTime.getMinutes() + duration
                      );

                      if (appointment?.blocking) {
                        endDateTime.setMinutes(
                          startDateTime.getMinutes() + blockingDuration
                        );
                      }

                      // Check if previous endDateTime is greater than the current startTime

                      const isPrevEndGreater =
                        prevEndDateTime[proIndex] > startDateTime;

                      // Update prevEndDateTime if necessary
                      if (endDateTime > prevEndDateTime[proIndex]) {
                        prevEndDateTime[proIndex] = endDateTime;
                      }

                      // Add condition to set gray background and disable slot
                      if (
                        isPrevEndGreater &&
                        professionalsId[proIndex] === pro._id
                      ) {
                        if (appointmentBlocking[proIndex]) {
                          return (
                            <div
                              key={index}
                              className={`h-6 z-10 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed`}
                              style={{
                                backgroundColor:
                                  proIndex % 2 === 0 ? "#AD8C8C" : "#AD8C8C",
                              }}
                              disabled
                            ></div>
                          );
                        }
                        return (
                          <div
                            key={index}
                            className={`h-6 ${proIndex % 2 === 0
                                ? professionalsAppt[proIndex] % 2 === 0
                                  ? "bg-gray-800"
                                  : "bg-slate-700"
                                : professionalsAppt[proIndex] % 2 === 0
                                  ? "bg-cyan-700"
                                  : "bg-sky-800"
                              } p-1 ${slotWidth}
                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                        cursor-pointer  text-white font-medium text-xs flex items-center justify-center`}
                            disabled={isDisabled}
                          ></div>
                        );
                      }

                      if (appointment) {
                        professionalsId[proIndex] = pro._id;
                        professionalsAppt[proIndex] = appointmentIndex;
                        if (appointment?.blocking) {
                          appointmentBlocking[proIndex] = true;
                          return (
                            <div
                              key={index}
                              className={`h-6 z-10 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed`}
                              style={{
                                backgroundColor:
                                  proIndex % 2 === 0 ? "#AD8C8C" : "#AD8C8C",
                              }}
                              disabled
                            >
                              <span className="font-extrabold text-white ml-1 truncate">
                                {appointment?.blockingReason}
                              </span>
                            </div>
                          );
                        } else {
                          appointmentBlocking[proIndex] = false;
                        }
                        return (
                          <div
                            key={index}
                            className={`h-6 ${proIndex % 2 === 0
                                ? appointmentIndex % 2 === 0
                                  ? "bg-gray-800"
                                  : "bg-slate-700"
                                : appointmentIndex % 2 === 0
                                  ? "bg-cyan-700"
                                  : "bg-sky-800"
                              } z-10 p-1 cursor-pointer text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            onClick={() =>
                              handleExistingAppointment(appointment)
                            }
                            disabled={isDisabled}
                          >
                            <span className="font-bold text-white mr-1 whitespace-nowrap">
                              {customerName}
                            </span>
                            <span className="text-gray-300">Services:</span>
                            <span className="italic text-white ml-1 truncate">
                              {serviceNames}
                            </span>
                          </div>
                        );
                      }

                      if (!isDisabled && !appointment) {
                        return (
                          <div
                            key={index}
                            className={`h-6 ${slotWidth} p-1 ${index !== 3 &&
                              "border-b border-dotted border-gray-400"
                              } cursor-crosshair hover:bg-gray-300`}
                            onClick={() =>
                              !isDisabled &&
                              !appointment &&
                              handleAppointment(startDateTime, pro._id)
                            }
                          ></div>
                        );
                      } else {
                        return (
                          <div
                            key={index}
                            className="h-6 p-1 text-white font-medium text-xs flex items-center justify-start hover:text-gray-500 cursor-not-allowed"
                            disabled
                            style={{
                              backgroundImage:
                                proIndex % 2 === 0
                                  ? `url(${stripeBackground})`
                                  : `url(${stripeBackground})`,
                              backgroundRepeat: "repeat",
                            }}
                          ></div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
      // Add separator between hours
      if (hourIndex < hoursArr.length - 1) {
        timeSlots.push(
          <div
            key={`separator-${hour}`}
            className={`h-px bg-gray-400 min-w-[${numProfessionals * 135 + 44
              }px]`}
          ></div>
        );
      }
    });

    return timeSlots;
  };

  const renderScheduler = () => {
    return (
      <div className="border border-gray-400 p-4 mb-3 overflow-y-auto">
        <div
          className={`flex items-center justify-between ${viewMode === "daily"
              ? `min-w-[${selectedProfessionals.length * 135 + 44}px]`
              : `min-w-[989px]`
            }`}
        >
          {renderTabs()}
          {viewMode === "daily" && (
            <div className="flex items-center">
              <button
                className="px-2 py-1 rounded-md text-sm"
                onClick={handlePreviousDate}
              >
                <IoIosArrowBack />
              </button>
              <h2 className="font-semibold text-sm">
                {formatDate(selectedDate)}
              </h2>
              <button
                className="px-2 py-1 rounded-md text-sm"
                onClick={handleNextDate}
              >
                <IoIosArrowForward />
              </button>
            </div>
          )}
          {viewMode === "weekly" && (
            <div className="flex items-center">
              <button
                className="px-2 py-1 rounded-md text-sm"
                onClick={handlePreviousWeekDate}
              >
                <IoIosArrowBack className="inline-block -mr-2" />
                <IoIosArrowBack className="inline-block" />
              </button>
              <h2 className="font-semibold text-sm">
                {formatDate(selectedWeekDate)}
              </h2>
              <button
                className="px-2 py-1 rounded-md text-sm"
                onClick={handleNextWeekDate}
              >
                <IoIosArrowForward className="inline-block" />
                <IoIosArrowForward className="inline-block -ml-2" />
              </button>
            </div>
          )}
        </div>

        <div
          className={`h-px bg-gray-500 mt-3 mb-1 ${viewMode === "daily"
              ? `min-w-[${selectedProfessionals.length * 135 + 44}px]`
              : `hidden`
            }`}
        ></div>

        {viewMode === "daily" && (
          <>
            <div
              className={`grid grid-cols-4 pt-2 min-w-[${selectedProfessionals.length * 135 + 44
                }px)`}
            >
              <div>
                <p className=" text-gray-500">
                  {formatDateShort(selectedDate)}
                </p>
              </div>
            </div>
          </>
        )}

        <div
          className={`h-px bg-gray-500 mt-3 ${viewMode === "daily"
              ? `min-w-[${selectedProfessionals.length * 135 + 44}px]`
              : `min-w-[989px]`
            }`}
        ></div>

        {viewMode === "daily"
          ? hoursArrs.map((hoursArrPeriod, ind) => {
            return (
              <>
                {renderDailyView(hoursArrPeriod, ind)}
                {ind !== hoursArrs.length - 1 && (
                  <div
                    key={ind}
                    className={`h-1 bg-gray-500 ${`min-w-[${selectedProfessionals.length * 135 + 44
                      }px]`}`}
                  ></div>
                )}
              </>
            );
          })
          : hoursArrsWeek.map((hoursArrWeekPeriod, ind) => {
            return renderWeeklyView(hoursArrWeekPeriod, ind);
          })}

        <ProcessAppointment
          isOpen={modelState}
          onClose={() => setModelState(!modelState)}
          setModelState={setModelState}
          setBooked={setBooked}
          setAlertMsg={setAlertMsg}
          setAlertMsgType={setAlertMsgType}
        />

        <Popup
          isOpen={viewModelState}
          onClose={() => setViewModelState(!viewModelState)}
          children={
            <ViewAppointment
              setModelState={setViewModelState}
              appointmentId={selectedAppointmentId}
            />
          }
        />
        <Popup
          isOpen={updateModelState}
          onClose={() => setUpdateModelState(!updateModelState)}
          children={
            <UpdateAppointment
              setModelState={setUpdateModelState}
              appointmentId={selectedAppointmentId}
              setBooked={setBooked}
              setAlertMsg={setAlertMsg}
              setAlertMsgType={setAlertMsgType}
            />
          }
        />
      </div>
    );
  };

  return <div>{renderScheduler()}</div>;
};

export default SchedulerC;
