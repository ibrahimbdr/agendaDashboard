import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine,
  RiCalendarEventFill,
  RiTimeFill,
  RiMoneyDollarCircleLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import SidebarContext from "../context/SidebarContext";
import { FiClock } from "react-icons/fi";

const PendingAppointments = () => {
  // Sample data
  const { shopId } = useContext(SidebarContext);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const token = localStorage.getItem("ag_app_shop_token");
  const [currentAppointments, setCurrentAppointments] = useState([]);
  const navigate = useNavigate();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;

  useEffect(() => {
    fetchAppointmentData();
  }, []);

  const fetchAppointmentData = () =>
    axios
      .get(`http://localhost:4040/appointments?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        const registeredAppointments = response.data.appointments
          .filter(
            (appt) =>
              !appt.blocking &&
              (appt.status === "pending" || appt.status === "updating")
          )
          .reverse();
        console.log(registeredAppointments);
        setPendingAppointments(registeredAppointments);
        setCurrentAppointments(
          registeredAppointments.slice(firstIndex, lastIndex)
        );
      })
      .catch((error) => {
        console.log(error);
      });

  // const currentAppointments = pendingAppointments.slice(firstIndex, lastIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedAppointment(null); // Reset selected appointment on page change

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    setCurrentAppointments(pendingAppointments.slice(startIndex, endIndex));
  };

  const handleAppointmentSelect = (appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCheckout = () => {
    // Perform checkout logic here
    console.log(selectedAppointment);
    selectedAppointment.status === "pending"
      ? localStorage.setItem(
          "ag_app_booking_info",
          JSON.stringify({
            customer: selectedAppointment.customer._id,
            professional: selectedAppointment.professional._id,
            service: selectedAppointment.service.map((s) => s._id),
            duration: selectedAppointment.service.reduce(
              (totalDuration, s) => totalDuration + s.duration,
              0
            ),
            dateTime: new Date(selectedAppointment.dateTime),
            amount: selectedAppointment.service.reduce(
              (totalPrice, s) => totalPrice + s.price,
              0
            ),
            appointmentId: selectedAppointment._id,
            managerId: shopId,
            checkoutType: "registering",
          })
        )
      : localStorage.setItem(
          "ag_app_booking_info",
          JSON.stringify({
            customer: selectedAppointment.customer._id,
            professional: selectedAppointment.professional._id,
            service: selectedAppointment.service.map((s) => s._id),
            product: selectedAppointment.product.map((p) => p._id),
            duration: selectedAppointment.service.reduce(
              (totalDuration, s) => totalDuration + s.duration,
              0
            ),
            dateTime: new Date(selectedAppointment.dateTime),
            amount:
              selectedAppointment.service.reduce(
                (totalPrice, s) => totalPrice + s.price,
                0
              ) +
              selectedAppointment.product.reduce(
                (totalPrice, p) => totalPrice + p.price,
                0
              ),
            appointmentId: selectedAppointment._id,
            managerId: shopId,
            checkoutType: "updating",
          })
        );

    // selectedAppointment.status === "pending"
    //   ? console.log({
    //       customer: selectedAppointment.customer._id,
    //       professional: selectedAppointment.professional._id,
    //       service: selectedAppointment.service.map((s) => s._id),
    //       duration: selectedAppointment.service.reduce(
    //         (totalDuration, s) => totalDuration + s.duration,
    //         0
    //       ),
    //       dateTime: new Date(selectedAppointment.dateTime),
    //       amount: selectedAppointment.service.reduce(
    //         (totalPrice, s) => totalPrice + s.price,
    //         0
    //       ),
    //       appointmentId: selectedAppointment._id,
    //       managerId: shopId,
    //       checkoutType: "registering",
    //     })
    //   : console.log({
    //       customer: selectedAppointment.customer._id,
    //       professional: selectedAppointment.professional._id,
    //       service: selectedAppointment.service.map((s) => s._id),
    //       product: selectedAppointment.product.map((p) => p._id),
    //       duration: selectedAppointment.service.reduce(
    //         (totalDuration, s) => totalDuration + s.duration,
    //         0
    //       ),
    //       dateTime: new Date(selectedAppointment.dateTime),
    //       amount:
    //         selectedAppointment.service.reduce(
    //           (totalPrice, s) => totalPrice + s.price,
    //           0
    //         ) +
    //         selectedAppointment.product.reduce(
    //           (totalPrice, p) => totalPrice + p.price,
    //           0
    //         ),
    //       appointmentId: selectedAppointment._id,
    //       managerId: shopId,
    //       checkoutType: "updating",
    //     });
    navigate("/checkout");
  };

  return (
    // In the return statement
    <div className="p-4 flex flex-col lg:flex-row">
      <div className="lg:w-3/4 pr-5">
        <h1 className="text-xl font-bold mb-6">Pending Appointments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className={`bg-white p-4 rounded-lg shadow-md ${
                selectedAppointment &&
                selectedAppointment._id === appointment._id
                  ? "ring-2 ring-gray-800"
                  : ""
              } cursor-pointer transition-colors duration-300 hover:bg-gray-100`}
              onClick={() => handleAppointmentSelect(appointment)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="mr-2">
                    {appointment.status === "pending" ? (
                      <RiCheckboxBlankCircleLine className="text-red-500 text-2xl" />
                    ) : (
                      <RiCheckboxBlankCircleLine className="text-yellow-500 text-2xl" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {appointment.customer.name}
                    </h2>
                    <div className="flex items-center text-gray-600">
                      <RiCalendarEventFill className="mr-1" />
                      <p className="text-sm">
                        {new Intl.DateTimeFormat(["ban", "id"]).format(
                          new Date(appointment.dateTime)
                        )}
                      </p>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <RiTimeFill className="mr-1" />
                      <p className="text-sm">
                        {new Intl.DateTimeFormat("en", {
                          timeStyle: "short",
                        }).format(new Date(appointment.dateTime))}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-lg font-semibold">
                  $
                  {/* {appointment.service.reduce(
                    (totalPrice, s) => totalPrice + s.price,
                    0
                  )} */}
                  {appointment?.product?.length > 0
                    ? (
                        appointment.service.reduce(
                          (totalPrice, s) => totalPrice + s.price,
                          0
                        ) +
                        appointment.product.reduce(
                          (totalPrice, p) => totalPrice + p.price,
                          0
                        )
                      ).toFixed(2)
                    : appointment.service
                        .reduce((totalPrice, s) => totalPrice + s.price, 0)
                        .toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {pendingAppointments.length > itemsPerPage && (
          <div className="mt-6">
            <nav className="flex items-center justify-center">
              <button
                className={`mr-2 px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {Array.from(
                {
                  length: Math.ceil(pendingAppointments.length / itemsPerPage),
                },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  className={`mx-2 px-4 py-2 rounded-md ${
                    currentPage === page
                      ? "bg-gray-800 text-white"
                      : "bg-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className={`ml-2 px-4 py-2 rounded-md ${
                  currentPage ===
                  Math.ceil(pendingAppointments.length / itemsPerPage)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(pendingAppointments.length / itemsPerPage)
                }
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
      <div className="lg:w-1/4">
        {selectedAppointment ? (
          <div className="mt-4 h-full">
            <div className="bg-white h-full p-4 rounded-lg shadow-md flex flex-col">
              <h2 className="text-xl font-semibold mb-2">
                {selectedAppointment.customer.name}
              </h2>
              <p className="text-gray-600 mb-4">
                Professional: {selectedAppointment.professional.name}
              </p>
              <div className="flex flex-col mb-4">
                <p className="text-sm text-gray-600 mb-1">Services:</p>
                {selectedAppointment.service.map((service, index) => (
                  <p
                    key={index}
                    className="text-gray-800 flex items-center flex-wrap text-sm"
                  >
                    <RiCheckboxCircleLine className="text-gray-800 mr-1" />
                    {service.name} (
                    <span className="flex items-center">
                      {service.duration} min <FiClock className="ml-1" />
                    </span>
                    )
                  </p>
                ))}
              </div>
              {selectedAppointment?.product?.length > 0 && (
                <div className="flex flex-col mb-4">
                  <p className="text-sm text-gray-600 mb-1">products:</p>
                  {selectedAppointment.product.map((product, index) => (
                    <p
                      key={index}
                      className="text-gray-800 flex items-center flex-wrap text-sm"
                    >
                      <RiCheckboxCircleLine className="text-gray-800 mr-1" />
                      {product.name}
                    </p>
                  ))}
                </div>
              )}
              <p className="text-gray-800 mb-4">
                <RiMoneyDollarCircleLine className="text-green-500 mr-1" />
                Price: $
                {selectedAppointment?.product?.length > 0
                  ? (
                      selectedAppointment.service.reduce(
                        (totalPrice, s) => totalPrice + s.price,
                        0
                      ) +
                      selectedAppointment.product.reduce(
                        (totalPrice, p) => totalPrice + p.price,
                        0
                      )
                    ).toFixed(2)
                  : selectedAppointment.service
                      .reduce((totalPrice, s) => totalPrice + s.price, 0)
                      .toFixed(2)}
              </p>
              <button
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md mt-auto"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center h-full">
            <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col justify-center text-center items-center">
              <RiCheckboxBlankCircleLine className="text-gray-800 text-5xl mb-4" />
              <h2 className="text-gray-800 text-3xl font-semibold mb-2">
                No selected appointment
              </h2>
              <p className="text-gray-600 text-lg">
                Please choose an appointment to proceed.
              </p>
              <button
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-md shadow-md hover:bg-gray-700"
                onClick={() => navigate("/")}
              >
                Book Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAppointments;
