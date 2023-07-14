import React, { useState, useContext, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi"; // Importing icons from react-icons library
import Popup from "../components/Popup";
import RegisterProduct from "../components/RegisterProduct";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import SidebarContext from "../context/SidebarContext";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import UpdateProduct from "../components/UpdateProduct";

const Products = () => {
  const { shopId } = useContext(SidebarContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("ag_app_shop_token");
  const [registerModelState, setRegisterModelState] = useState(false);
  const [updateModelState, setUpdateModelState] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isDeleting, setDeleting] = useState(false);

  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/products/shop?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data.products);
        setProducts([...response.data.products].reverse());
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, [registerModelState, updateModelState]);

  // const products = [
  //   {
  //     id: "7",
  //     name: "shampoo",
  //     speciality: "Products",
  //     price: "10.50",
  //     cost_brl: "10.06",
  //     stock: "5.00",
  //   },
  // ];
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const lastProductIndex = currentPage * productsPerPage;
  const firstProductIndex = lastProductIndex - productsPerPage;
  const currentProducts = filteredProducts.slice(
    firstProductIndex,
    lastProductIndex
  );

  const handleSearchQueryChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const handleAppointmentsPerPageChange = (event) => {
    setProductsPerPage(parseInt(event.target.value));
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

  async function deleteProduct(id) {
    console.log(id);
    await fetch(`https://agenda-back.onrender.com/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())

      .then((data) => console.log(data));
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

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Select all IDs
      const allIds = currentProducts.map((product) => product["_id"]);
      setSelectedIds(allIds);
    } else {
      // Deselect all IDs
      setSelectedIds([]);
    }
  };

  const handleRemoveSelected = () => {
    selectedIds.forEach((id) => {
      axios
        .delete(`https://agenda-back.onrender.com/products/${id}`, {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          // Handle successful deletion
          console.log(`Product with ID ${id} has been deleted.`);
          setDeleting(false);
        })
        .catch((error) => {
          // Handle error
          console.error(`Failed to delete product with ID ${id}.`, error);
        });
    });
  };

  const handleCancel = () => {
    setDeleting(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-800 font-bold mb-5">Products</h1>
      <div className="flex items-center relative">
        <input
          type="text"
          className="py-2 pl-8 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:border-blue-500 w-full"
          placeholder="Search by product..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
        <button className="absolute right-0 mr-2 focus:outline-none">
          <FiSearch className="text-gray-500" />
        </button>
      </div>

      <div className="flex items-center my-4">
        <div className="flex items-center my-4">
          <button
            className="bg-gray-800 hover:bg-gray-600 text-white text-sm font-semibold py-2 px-4 rounded flex items-center justify-center"
            onClick={() => setRegisterModelState(true)}
          >
            <FaPlus className="mr-2" /> New Product
          </button>
          <Popup
            isOpen={registerModelState}
            onClose={() => setRegisterModelState(!registerModelState)}
            children={<RegisterProduct setModelState={setRegisterModelState} />}
          />
        </div>
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
          value={productsPerPage}
          onChange={handleAppointmentsPerPageChange}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-gray-600">
          {`${firstProductIndex + 1}-${Math.min(
            lastProductIndex,
            filteredProducts.length
          )} of ${filteredProducts.length}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 pl-4 text-start">
                <input type="checkbox" onChange={handleSelectAll} />
              </th>
              <th className="py-3 px-4 text-left">Id</th>
              <th className="py-3 text-left">Name</th>
              <th className="py-3 pr-6 text-left">Speciality</th>
              <th className="py-3 pr-6 text-left">Price R$</th>
              <th className="py-3 pr-6 text-left">Cost BRL</th>
              <th className="py-3 pr-6 text-left">Stock</th>
              <th className="py-3 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product, index) => (
              <tr
                key={product.name}
                className="border-b border-gray-300 text-gray-800 text-xs"
              >
                <td className="py-2 pl-4 text-start">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product._id)}
                    onChange={() => handleCheckboxChange(product._id)}
                  />
                </td>
                <td className="py-2 px-3 text-left">{index + 1}</td>
                <td className="py-2 text-left">{product.name}</td>
                <td className="py-2 text-left">{product.speciality}</td>
                <td className="py-2 text-left">{product.price}</td>
                <td className="py-2 text-left">{product.costBRL}</td>
                <td className="py-2 text-left">{product.stock}</td>
                <td className="py-2 text-center pe-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => {
                      setUpdateModelState(!updateModelState);
                      setSelectedProductId(product._id);
                    }}
                  >
                    <FaEdit />
                  </button>
                  <Popup
                    isOpen={updateModelState}
                    onClose={() => setUpdateModelState(!updateModelState)}
                    children={
                      <UpdateProduct
                        setModelState={setUpdateModelState}
                        productId={selectedProductId}
                      />
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full mt-4">
            <div className="text-center">
              <FaSearch className="mx-auto text-gray-500 text-5xl mb-4" />
              <p className="text-gray-800 text-lg mb-2">No products found</p>
              <p className="text-gray-500 text-sm">
                We couldn't find any products that match your search
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

export default Products;
