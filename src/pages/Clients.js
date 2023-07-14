import React, { useState, useContext, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi"; // Importing icons from react-icons library
import RegisterCustomer from "../components/RegisterCustomer";
import Popup from "../components/Popup";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import UpdateCustomer from "../components/UpdateCustomer";

const Clients = () => {
  const { shopId } = useContext(SidebarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [registerModelState, setRegisterModelState] = useState(false);
  const [updateModelState, setUpdateModelState] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isDeleting, setDeleting] = useState(false);

  const token = localStorage.getItem("ag_app_shop_token");
  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/customers/shop?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        setClients([...response.data].reverse());
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [registerModelState, updateModelState, isDeleting]);

  // const clients = [
  //   {
  //     name: "John Doe",
  //     phone: "555-1234",
  //     payments: 3,
  //   },
  //   {
  //     name: "Jane Smith",
  //     phone: "555-5678",
  //     payments: 5,
  //   },
  //   {
  //     name: "Bob Johnson",
  //     phone: "555-9012",
  //     payments: 2,
  //   },
  //   {
  //     name: "Sally Lee",
  //     phone: "555-3456",
  //     payments: 4,
  //   },
  //   {
  //     name: "Tom Davis",
  //     phone: "555-7890",
  //     payments: 1,
  //   },
  //   {
  //     name: "Karen Brown",
  //     phone: "555-2345",
  //     payments: 6,
  //   },
  //   {
  //     name: "Mike Wilson",
  //     phone: "555-6789",
  //     payments: 2,
  //   },
  //   {
  //     name: "Emily Taylor",
  //     phone: "555-0123",
  //     payments: 5,
  //   },
  //   {
  //     name: "Chris Martin",
  //     phone: "555-4567",
  //     payments: 3,
  //   },
  //   {
  //     name: "Lisa Hernandez",
  //     phone: "555-8901",
  //     payments: 4,
  //   },
  // ];
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const lastClientIndex = currentPage * clientsPerPage;
  const firstClientIndex = lastClientIndex - clientsPerPage;
  const currentClients = filteredClients.slice(
    firstClientIndex,
    lastClientIndex
  );

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const handleClientsPerPageChange = (event) => {
    setClientsPerPage(parseInt(event.target.value));
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
    if (selectedIds.length === currentClients.length) {
      // All IDs are selected, deselect all IDs
      setSelectedIds([]);
    } else {
      // Not all IDs are selected, select all IDs
      const allIds = currentClients.map((client) => client.id);
      setSelectedIds(allIds);
    }
  };

  function deleteCustomer(id) {
    fetch(`https://agenda-back.onrender.com/customers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())

      .then((data) => console.log(data));
  }

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => {
      axios
        .delete(`https://agenda-back.onrender.com/customers/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          // Handle successful deletion
          console.log(`Customer with ID ${id} has been deleted.`);
          setDeleting(false);
        })
        .catch((error) => {
          // Handle error
          console.error(`Failed to delete customer with ID ${id}.`, error);
        });
    });
  };

  const handleCancel = () => {
    setDeleting(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-800 font-bold mb-5">Customers</h1>
      <div className="flex items-center relative">
        <input
          type="text"
          className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <button className="absolute right-0 mr-2 focus:outline-none">
          <FiSearch className="text-gray-500" />
        </button>
      </div>

      <div className="flex items-center my-4">
        <button
          className="bg-gray-800 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded flex items-center justify-center"
          onClick={() => {
            setRegisterModelState(true);
          }}
        >
          <FaPlus className="mr-2" /> New Client
        </button>
        <Popup
          isOpen={registerModelState}
          onClose={() => setRegisterModelState(!registerModelState)}
          children={<RegisterCustomer setModelState={setRegisterModelState} />}
        />

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
            <div className="bg-white rounded-md p-4 flex justify-center items-center">
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
          value={clientsPerPage}
          onChange={handleClientsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-gray-600">
          {`${firstClientIndex + 1}-${Math.min(
            lastClientIndex,
            filteredClients.length
          )} of ${filteredClients.length}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 pl-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === currentClients.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 text-left">Phone</th>
              <th className="py-3 text-left">Payments $</th>
              <th className="py-3 pr-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentClients.map((client) => (
              <tr
                key={client.name}
                className="border-b border-gray-300 text-gray-800 text-xs"
              >
                <td className="py-2 ps-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(client.id)}
                    onChange={() => handleCheckboxChange(client.id)}
                  />
                </td>
                <td className="py-2">{client.name}</td>
                <td className="py-2">{client.phone}</td>
                <td className="py-2">{client.payments || 0}</td>
                <td className="py-2 pr-6 text-center">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setUpdateModelState(!updateModelState);
                      setSelectedClientId(client._id);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <Popup
                    isOpen={updateModelState}
                    onClose={() => setUpdateModelState(!updateModelState)}
                    children={
                      <UpdateCustomer
                        setModelState={setUpdateModelState}
                        customerId={selectedClientId}
                      />
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full mt-4">
            <div className="text-center">
              <FaSearch className="mx-auto text-gray-500 text-5xl mb-4" />
              <p className="text-gray-800 text-lg mb-2">No clients found</p>
              <p className="text-gray-500 text-sm">
                We couldn't find any clients that match your search
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

export default Clients;
