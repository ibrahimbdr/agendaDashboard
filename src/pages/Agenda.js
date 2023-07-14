import React, { useState, useContext, useEffect } from "react";
import Calendar from "react-calendar";
import Schedular from "../components/Schedular";
import SchedularC from "../components/Schedular-c";
import "react-calendar/dist/Calendar.css";
import ArrowLeftSrc from "../images/arrow-left.svg";
import ArrowRightSrc from "../images/arrow-right.svg";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import ViewModeContext from "../context/ViewModeContext";
import { FaCheck, FaCircle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { AiOutlineInbox } from "react-icons/ai";
import { HiEmojiSad } from "react-icons/hi";
import Alert from "../components/Alert";

const Agenda = () => {
  const { shopName, shopId } = useContext(SidebarContext);

  const [date, setDate] = useState(new Date());
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
  const [startWeekDate, setStartWeekDate] = useState(getStartOfWeek(date));
  const token = localStorage.getItem("ag_app_shop_token");
  const [appointments, setAppointments] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [myShopImg, setMyShopImg] = useState("");
  const [workingHours, setWorkingHours] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedProfessionals, setSelectedProfessionals] = useState([]);
  const { viewMode } = useContext(ViewModeContext);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [booked, setBooked] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertMsgType, setAlertMsgType] = useState("");

  useEffect(() => {
    if (shopId !== "") {
      axios
        .get(`https://agenda-back.onrender.com/appointments?shopId=${shopId}`, {
          headers: {
            Authorization: token,
          },
        })

        .then((response) => {
          setAppointments(response.data.appointments);
          // console.log(response.data.appointments);
          // setIsLoading(false);
        });
    }
  }, [shopId]);

  useEffect(() => {
    axios
      .get("https://agenda-back.onrender.com/managers/id", {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setMyShopImg(response.data.profileImg);
        response.data?.workingHours &&
          setWorkingHours(response.data?.workingHours);
        axios
          .get(
            `https://agenda-back.onrender.com/professionals/shop?shopId=${response.data._id}`,
            {
              headers: {
                Authorization: token,
              },
            }
          )
          .then((response) => {
            setProfessionals([...response.data.data].reverse());
            // console.log([...response.data.data].reverse());
            setSelectedProfessionals([...response.data.data].reverse());
            setSelectedProfessional([...response.data.data].reverse()[0]);
            setIsLoading(false);
          })
          .catch((error) => console.error(error.message));
      })
      .catch((error) => console.log(error));
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col justify-center items-center space-x-2">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <span className="mt-2">Loading...</span>
        </div>
      </div>
    );
  }

  const handleProfessionalChange = (event) => {
    const professionalId = event.target.value;
    const selectedProfessional = professionals.find(
      (professional) => professional._id === professionalId
    );
    setSelectedProfessional(selectedProfessional);
  };

  const handleCheckboxChange = (event) => {
    const professionalId = event.target.value;
    const isChecked = event.target.checked;
    if (isChecked) {
      const selectedProfessional = professionals.find(
        (professional) => professional._id === professionalId
      );
      setSelectedProfessionals((prevSelectedProfessionals) => [
        ...prevSelectedProfessionals,
        selectedProfessional,
      ]);
    } else {
      setSelectedProfessionals((prevSelectedProfessionals) =>
        prevSelectedProfessionals.filter(
          (professional) => professional._id !== professionalId
        )
      );
    }
  };

  const handleSelectAllCheckbox = (event) => {
    const isChecked = event.target.checked;

    if (isChecked) {
      setSelectedProfessionals(professionals);
    } else {
      setSelectedProfessionals([]);
    }
  };

  // const formattedDate = new Intl.DateTimeFormat("en-US", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  // }).format(date);

  function handleDateClick(date) {
    // console.log(date);
    setDate(date);
  }

  const handleSelectedDateChange = (date) => {
    setDate(date);
  };

  const handleSelectedWeekDateChange = (date) => {
    setStartWeekDate(date);
  };

  return (
    <>
      {booked && (
        <Alert type={alertMsgType} message={alertMsg} setBooked={setBooked} />
      )}
      <div className="grid grid-cols-1 gap-1 md:flex md: mx-auto px-2 mt-2 pb-2">
        <div className="flex flex-col flex-wrap md:flex-nowrap mr-2 mb-4 md:w-52 w-full">
          <div className="md:hidden flex justify-center w-full items-center border border-gray-400 p-4 mb-3">
            <img
              className="h-11 w-11 rounded-full object-cover border border-gray-400 bg-white mr-2 mb-2 md:mb-0 md:mr-3 md:w-20 md:h-20"
              src={`https://agenda-back.onrender.com/uploads/profile/${myShopImg}`}
              alt="Shop logo"
            />
            <h1 className="text-lg font-bold">{`${shopName}`}</h1>
          </div>
          <div className="w-full md:w-auto mb-3 md:mb-0 flex justify-center ">
            <Calendar
              value={date}
              onChange={handleDateClick}
              className="border-none text-xs p-2"
              locale="en"
              next2Label={null}
              prev2Label={null}
              prevLabel={<ArrowLeft />}
              nextLabel={<ArrowRight />}
            />
          </div>
          <div className="hidden md:flex justify-center items-center border border-gray-400 p-4 mt-3">
            <img
              className="h-11 w-11 rounded-full object-cover border border-gray-400 bg-white mr-2 mb-2 md:mb-0 md:mr-3 md:w-20 md:h-20"
              src={`https://agenda-back.onrender.com/uploads/profile/${myShopImg}`}
              alt="Shop logo"
            />
          </div>
          <div className="flex flex-col items-start border border-gray-400 p-4 mt-3">
            {viewMode === "daily" ? (
              <>
                <label className="mb-1 font-bold">Select Professionals:</label>
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="select-all-checkbox"
                      checked={
                        selectedProfessionals.length === professionals.length
                      }
                      onChange={handleSelectAllCheckbox}
                      className="hidden"
                    />
                    <label
                      htmlFor="select-all-checkbox"
                      className="flex items-center font-semibold"
                    >
                      <div className="checkmark w-4 h-4 mx-2 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                        {selectedProfessionals.length ===
                          professionals.length && (
                          <FaCircle className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      Select All
                    </label>
                  </div>
                  {professionals.map((professional) => (
                    <div
                      key={professional._id}
                      className="service-item flex items-center"
                    >
                      <input
                        type="checkbox"
                        id={professional._id}
                        value={professional._id}
                        checked={selectedProfessionals.some(
                          (p) => p._id === professional._id
                        )}
                        onChange={handleCheckboxChange}
                        className="hidden"
                      />
                      <label
                        htmlFor={professional._id}
                        className="service-name text-sm font-medium text-gray-700 flex  items-center"
                      >
                        <div className="checkmark w-4 h-4 mx-2 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                          {selectedProfessionals.some(
                            (p) => p._id === professional._id
                          ) && <FaCheck className="w-3 h-3 text-green-600" />}
                        </div>
                        {professional.name}
                      </label>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <label className="mb-1 font-bold">Select Professional:</label>
                <div>
                  {professionals.map((professional) => (
                    <div
                      key={professional._id}
                      className="flex items-center mb-2"
                    >
                      <input
                        type="radio"
                        id={professional._id}
                        value={professional._id}
                        checked={selectedProfessional?._id === professional._id}
                        onChange={handleProfessionalChange}
                        className="hidden"
                      />
                      <label
                        htmlFor={professional._id}
                        className="flex items-center cursor-pointer"
                      >
                        <span className="mr-2">
                          {selectedProfessional?._id === professional._id ? (
                            <FaCheckCircle className="text-green-700" />
                          ) : (
                            <FaCircle className="text-gray-400" />
                          )}
                        </span>
                        <span>{professional.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-full md:flex-1">
          {viewMode === "daily" ? (
            selectedProfessionals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-3xl font-bold mb-4">
                  <AiOutlineInbox className="inline-block mr-2" />
                  No Professionals Selected
                </div>
                <div className="text-gray-600 text-lg mb-8">
                  Please select professionals to show the Schedular.
                </div>
                <HiEmojiSad className="text-6xl text-gray-500" />
              </div>
            ) : (
              <SchedularC
                selectedProfessionals={selectedProfessionals}
                startWeekDate={startWeekDate}
                date={date}
                workingHours={workingHours}
                onSelectedDateChange={handleSelectedDateChange}
                onSelectedWeekDateChange={handleSelectedWeekDateChange}
                setBooked={setBooked}
                setAlertMsg={setAlertMsg}
                setAlertMsgType={setAlertMsgType}
              />
            )
          ) : (
            <SchedularC
              selectedProfessional={selectedProfessional}
              startWeekDate={startWeekDate}
              date={date}
              workingHours={workingHours}
              onSelectedDateChange={handleSelectedDateChange}
              onSelectedWeekDateChange={handleSelectedWeekDateChange}
              setBooked={setBooked}
              setAlertMsg={setAlertMsg}
              setAlertMsgType={setAlertMsgType}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Agenda;

const ArrowLeft = () => {
  return (
    <div className="flex justify-center items-center">
      <img src={ArrowLeftSrc} alt="" />
    </div>
  );
};

const ArrowRight = () => {
  return (
    <div className="flex justify-center items-center">
      <img src={ArrowRightSrc} alt="" />
    </div>
  );
};
