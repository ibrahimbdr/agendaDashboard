import React, { useState, useContext, useEffect } from "react";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from "react-icons/fi"; // Importing icons from react-icons library
import Sidebar from "../components/Sidebar";
import SidebarContext from "../context/SidebarContext";
import Header from "../components/Header";
import {
  FaCheck,
  FaCheckCircle,
  FaDashcube,
  FaDollarSign,
  FaExclamationTriangle,
  FaHandHolding,
  FaHandHoldingUsd,
  FaMoneyCheckAlt,
  FaPowerOff,
  FaSearch,
  FaSpinner,
  FaStop,
  FaStopCircle,
  FaTimesCircle,
} from "react-icons/fa";
import axios from "axios";
import Popup from "../components/Popup";

const AppointmentsList = () => {
  const { shopId } = useContext(SidebarContext);
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [appointmentsPerPage, setAppointmentsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [isDeleting, setDeleting] = useState(false);
  const token = localStorage.getItem("ag_app_shop_token");
  useEffect(() => {
    fetchAppointmentData();
  }, [isDeleting]);

  const fetchAppointmentData = () =>
    axios
      .get(`http://localhost:4040/appointments?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data.appointments);
        const registeredAppointments = response.data.appointments.filter(
          (appt) => !appt.blocking
        );
        setAppointments([...registeredAppointments].reverse());
      })
      .catch((error) => {
        console.log(error);
      });

  const filteredAppointments = appointments.filter((appointmet) =>
    appointmet.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(
    filteredAppointments.length / appointmentsPerPage
  );
  const lastAppointmentIndex = currentPage * appointmentsPerPage;
  const firstAppointmentIndex = lastAppointmentIndex - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    firstAppointmentIndex,
    lastAppointmentIndex
  );

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const handleAppointmentsPerPageChange = (event) => {
    setAppointmentsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };
  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pagination = [];
  for (let i = 1; i <= totalPages; i++) {
    pagination.push(
      <button
        key={i}
        className={`${
          currentPage === i
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-100 text-gray-600"
        } px-4 py-2 mx-1 rounded-md`}
        onClick={() => handlePageClick(i)}
      >
        {i}
      </button>
    );
  }

  function handlePayment(id, value) {
    console.log("id: " + id + " value: " + value);
    fetch(`http://localhost:4040/appointments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ status: value }),
    })
      .then((response) => response.json())

      .then((data) => console.log(data.appointment))

      .catch((error) => console.log(error));

    fetchAppointmentData();
  }

  const [selectedIds, setSelectedIds] = useState([]);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(id)) {
        // ID already exists, remove it from the array
        return prevSelectedIds.filter((selectedId) => selectedId !== id);
      } else {
        // ID doesn't exist, add it to the array
        return [...prevSelectedIds, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentAppointments.length) {
      // All IDs are selected, deselect all IDs
      setSelectedIds([]);
    } else {
      // Not all IDs are selected, select all IDs
      const allIds = currentAppointments.map((appointment) => appointment._id);
      setSelectedIds(allIds);
    }
  };

  // useEffect(() => {
  //   console.log(selectedIds);
  // }, [selectedIds]);

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => {
      axios
        .delete(`http://localhost:4040/appointments/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          // Handle successful deletion
          console.log(`Appointment with ID ${id} has been deleted.`);
          setDeleting(false);
        })
        .catch((error) => {
          // Handle error
          console.error(`Failed to delete appointment with ID ${id}.`, error);
        });
    });
  };

  const handleCancel = () => {
    setDeleting(false);
  };

  function getStatusStyle(status) {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "updating":
        return "text-blue-500";
      case "confirmed":
        return "text-green-500";
      case "cancelled":
        return "text-red-500";
      default:
        return "";
    }
  }

  function renderStatusIcon(status) {
    switch (status) {
      case "pending":
        return <FaSpinner className="inline-block mr-1" />;
      case "updating":
        return <FaExclamationTriangle className="inline-block mr-1" />;
      case "confirmed":
        return <FaCheckCircle className="inline-block mr-1" />;
      case "cancelled":
        return <FaTimesCircle className="inline-block mr-1" />;
      default:
        return null;
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-800 font-bold mb-5">Appointments</h1>
      <div className="flex items-center relative">
        <input
          type="text"
          className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <button className="absolute right-0 mr-2 focus:outline-none">
          <FiSearch className="text-gray-500" />
        </button>
      </div>
      <div className="flex items-center my-4">
        <button
          className={`ml-2 ${
            selectedIds.length === 0
              ? "bg-red-400"
              : "bg-red-500 hover:bg-red-700"
          } text-white text-sm font-semibold py-2 px-4 rounded`}
          onClick={() => setDeleting(true)}
          disabled={selectedIds.length === 0}
        >
          Remove Selected
        </button>
        <Popup
          isOpen={isDeleting}
          onClose={() => setDeleting(!isDeleting)}
          children={
            <div className="bg-white rounded-md p-4 flex justify-center items-center ">
              <p className="text-gray-700">
                Are you sure you want to delete the selected items?
              </p>
              <div className="flex mt-4">
                <button
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white text-sm font-semibold py-2 px-4 rounded"
                  onClick={handleRemoveSelected}
                >
                  Confirm
                </button>
                <button
                  className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold py-2 px-4 rounded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          }
        />
      </div>
      <div className="mb-6">
        <label htmlFor="clients-per-page" className="mr-4 font-medium text-sm">
          Show:
        </label>
        <select
          id="clients-per-page"
          className="border border-gray-300 rounded px-2 py-1 mr-4 text-sm"
          value={appointmentsPerPage}
          onChange={handleAppointmentsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-gray-600">
          {`${firstAppointmentIndex + 1}-${Math.min(
            lastAppointmentIndex,
            filteredAppointments.length
          )} of ${filteredAppointments.length}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 pl-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentAppointments.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="py-3 pl-2 text-left">Client</th>
              <th className="py-3 text-left">Resbonsible</th>
              <th className="py-3 text-left">Services</th>
              <th className="py-3 pr-6 text-left">Time</th>
              <th className="py-3 pr-6 text-left">Date</th>
              <th className="py-3 pr-6 text-left">Payment status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAppointments.map((appointment) => (
              <tr
                key={appointment._id}
                className="border-b border-gray-300 text-gray-800 text-xs"
              >
                <td className="py-2 pl-3 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(appointment._id)}
                    onChange={() => handleCheckboxChange(appointment._id)}
                  />
                </td>
                <td className="py-2 pl-2">{appointment.customer.name}</td>
                <td className="py-2">{appointment.professional.name}</td>
                <td className="py-2">
                  {appointment.service.map((s, index) => (
                    <span key={index}>{s.name}, </span>
                  ))}
                </td>
                <td className="py-2">
                  {new Intl.DateTimeFormat("en", {
                    timeStyle: "short",
                  }).format(new Date(appointment.dateTime))}
                </td>
                <td className="py-2 text-left">
                  {new Intl.DateTimeFormat(["ban", "id"]).format(
                    new Date(appointment.dateTime)
                  )}
                </td>
                <th
                  className={`py-2 pr-6 text-left ${getStatusStyle(
                    appointment.status
                  )}`}
                >
                  {renderStatusIcon(appointment.status)} {appointment.status}
                </th>
                {/* <td className="py-2 pr-6 text-right">
                  <button
                    className={`flex items-center ml-auto rounded-md px-4 py-2 text-white font-bold  ${
                      appointment.status !== "pending"
                        ? "opacity-50 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-700"
                    }`}
                    onClick={() =>
                      handlePayment(
                        appointment["_id"],
                        appointment.status === "pending"
                          ? "confirmed"
                          : "pending"
                      )
                    }
                    disabled={appointment.status !== "pending"}
                  >
                    {appointment.status !== "pending" ? (
                      <FiCheckCircle className="text-green-600 text-lg" />
                    ) : (
                      <span>Confirm</span>
                    )}
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full mt-4">
            <div className="text-center">
              <FaSearch className="mx-auto text-gray-500 text-5xl mb-4" />
              <p className="text-gray-800 text-lg mb-2">
                No appointments found
              </p>
              <p className="text-gray-500 text-sm">
                We couldn't find any appointments that match your search
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6">
        <div className="flex">
          <button
            className={`${
              currentPage === 1
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-300"
            } px-4 py-2 mx-1 rounded-md`}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>
          {pagination}
          <button
            className={`${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                : "bg-gray-100 text-gray-600 hover:bg-gray-300"
            } px-4 py-2 mx-1 rounded-md`}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList;
