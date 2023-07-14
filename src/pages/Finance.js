import React, { useContext, useEffect, useState } from "react";
import SidebarContext from "../context/SidebarContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";
import sumBy from "lodash/sumBy";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { RiShoppingCartLine } from "react-icons/ri";

import { MdAttachMoney } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";

const Finance = () => {
  const { shopId } = useContext(SidebarContext);
  let [totalEarnings, setTotalEarnings] = useState(0);
  let [totalEarningsLast30Days, setTotalEarningsLast30Days] = useState(0);
  let [totalSoldProducts, setTotalSoldProducts] = useState(0);
  const [transactionsPerPage, setTransactionsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [dataByDay, setDataByDay] = useState([]);
  const [dataByService, setDataByService] = useState([]);
  const [dataByProduct, setDataByProduct] = useState([]);
  const token = localStorage.getItem("ag_app_shop_token");

  useEffect(() => {
    fetch(`https://agenda-back.onrender.com/payments?shopId=${shopId}`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setTransactions([...data.payments].reverse());
        console.log(data);

        let earningsByDay = {};
        let earningsByService = {};
        let earningsByProduct = {};
        let totalEarn = 0;
        let totalSoldProducts = 0;
        let totalEarnLast30Days = 0;

        data.payments.forEach((payment) => {
          // Earnings by day
          const date = new Date(payment.dateTime);

          // Get the date without the time component
          const day = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );

          if (earningsByDay[day]) {
            earningsByDay[day] += payment.amount;
          } else {
            earningsByDay[day] = payment.amount;
          }

          // Earnings by service
          if (payment.service.length > 0) {
            payment.service.forEach((service) => {
              if (earningsByService[service.name]) {
                earningsByService[service.name] += service.price;
              } else {
                earningsByService[service.name] = service.price;
              }
            });
          }

          // Earnings by product
          if (payment.product.length > 0) {
            const productName = payment.product.name;
            if (earningsByProduct[productName]) {
              earningsByProduct[productName] += payment.product.price;
            } else {
              earningsByProduct[productName] = payment.product.price;
            }
            totalSoldProducts++;
          }

          const timeDiff = Math.abs(new Date().getTime() - date.getTime());

          // Convert the time difference to days
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          if (daysDiff <= 30) {
            totalEarnLast30Days += payment.amount;
          }
          totalEarn += payment.amount;
        });

        // Filter earnings by day to include only the last 7 days and calculate total earnings per day
        const currentDate = new Date();
        const lastSevenDays = [];
        for (let i = 6; i >= 0; i--) {
          const day = new Date(currentDate);
          day.setDate(currentDate.getDate() - i);
          const dayWithoutTime = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate()
          );
          const earnings = earningsByDay[dayWithoutTime] || 0;
          lastSevenDays.push({
            date: new Intl.DateTimeFormat("en", { weekday: "short" }).format(
              day
            ),
            earnings,
          });
        }

        // Convert earnings by service to an array of objects
        const dataByService = Object.entries(earningsByService).map(
          ([service, earnings]) => ({
            service,
            earnings,
          })
        );

        // Convert earnings by product to an array of objects
        const dataByProduct = Object.entries(earningsByProduct).map(
          ([product, earnings]) => ({
            product,
            earnings,
          })
        );

        // Calculate total earnings for the last 30 days
        currentDate.setHours(0, 0, 0, 0); // Set current date to the beginning of the day
        console.log(lastSevenDays);

        setDataByDay(lastSevenDays);
        setDataByService(dataByService);
        setDataByProduct(dataByProduct);
        setTotalEarnings(totalEarn);
        setTotalEarningsLast30Days(totalEarnLast30Days);
        setTotalSoldProducts(totalSoldProducts);
      });
  }, []);

  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  const lastTransactionIndex = currentPage * transactionsPerPage;
  const firstTransactionIndex = lastTransactionIndex - transactionsPerPage;
  const currentTransactions = transactions.slice(
    firstTransactionIndex,
    lastTransactionIndex
  );

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

  const [appointments, setAppointments] = useState([]);
  const [nextSevenDaysAppointments, setNextSevenDaysAppointments] = useState(
    []
  );

  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/appointments?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data.appointments);
        setAppointments(response.data.appointments);

        // Get the next 7 days' appointments
        const today = new Date();
        const nextSevenDays = [];
        for (let i = 1; i <= 7; i++) {
          const day = new Date(today);
          day.setDate(today.getDate() + i);
          nextSevenDays.push(day.toLocaleDateString());
        }

        const nextSevenDaysAppointments = response.data.appointments.filter(
          (appointment) =>
            nextSevenDays.includes(
              new Date(appointment.dateTime).toLocaleDateString()
            )
        );
        setNextSevenDaysAppointments(nextSevenDaysAppointments);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/customers/shop?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data);
        setCustomers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios
      .get(`https://agenda-back.onrender.com/products/shop?shopId=${shopId}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((response) => {
        console.log(response.data.products);
        setProducts(response.data.products);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="flex w-full flex-col h-full overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-gray-800 font-bold mb-5">Finance</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Earnings</h2>
          <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-100 rounded-lg p-4">
            <div className="mb-4 sm:mb-0 sm:mr-8">
              <div className="text-3xl font-bold text-blue-500">
                ${totalEarningsLast30Days.toFixed(2)}
              </div>
              <div className="text-lg font-semibold text-gray-500">
                Last 30 days
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-lg font-semibold text-gray-500">
                Total Earnings
              </div>
              <div className="text-2xl font-bold text-blue-500">
                ${totalEarnings.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Total Customers</h2>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-green-500">
              {customers.length}
            </div>
            <div className="text-lg font-semibold text-gray-500">All time</div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Total Sold Products</h2>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-red-500">
              {totalSoldProducts}
            </div>
            <div className="text-lg font-semibold text-gray-500">All time</div>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Reserved Appointments</h2>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-purple-500">
              {nextSevenDaysAppointments.length}
            </div>
            <div className="text-lg font-semibold text-gray-500">
              Next 7 days
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Earnings by Day</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dataByDay}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="earnings" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-bold mb-4">Earnings by Service</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dataByService}>
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="earnings" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-md p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Transactions</h2>
        </div>
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-200">
                <tr className="text-xs font-medium tracking-wider text-left text-gray-600 uppercase border-b border-gray-300">
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Professional</th>
                  <th className="px-4 py-2">Service</th>
                  <th className="px-4 py-2">Product</th>
                  <th>Method</th>
                  <th>Date</th>
                  <th className="px-4 py-2">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal text-left text-gray-700 divide-y divide-gray-300">
                {currentTransactions.map((transaction, index) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-2">
                      {firstTransactionIndex + index + 1}
                    </td>
                    <td className="px-4 py-2">{transaction.customer.name}</td>
                    <td className="px-4 py-2">
                      {transaction.professional.name}
                    </td>
                    <td className="px-4 py-2">
                      {transaction.service
                        ?.reduce((uniqueServices, service) => {
                          const existingService = uniqueServices.find(
                            (s) => s._id === service._id
                          );

                          if (existingService) {
                            existingService.count += 1;
                          } else {
                            uniqueServices.push({ ...service, count: 1 });
                          }

                          return uniqueServices;
                        }, [])
                        .map((service, index) => (
                          <span key={index}>
                            {service.name}{" "}
                            {service.count > 1 ? `x${service.count}` : ""}
                          </span>
                        ))}
                    </td>

                    {transaction.product.length > 0 ? (
                      <td className="px-4 py-2">
                        {transaction.product
                          ?.reduce((uniqueProducts, product) => {
                            const existingProduct = uniqueProducts.find(
                              (p) => p._id === product._id
                            );

                            if (existingProduct) {
                              existingProduct.count += 1;
                            } else {
                              uniqueProducts.push({ ...product, count: 1 });
                            }

                            return uniqueProducts;
                          }, [])
                          .map((product, index) => (
                            <span key={index}>
                              {product.name}{" "}
                              {product.count > 1 ? `x${product.count}` : ""}
                            </span>
                          ))}
                      </td>
                    ) : (
                      <td className="px-4 py-2">-</td>
                    )}
                    <td>{transaction.method && transaction?.method}</td>
                    <td>
                      {new Intl.DateTimeFormat(["ban", "id"]).format(
                        new Date(transaction.dateTime)
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center">
                        <span className="mr-1">
                          <MdAttachMoney />
                        </span>
                        <span>{transaction.amount.toFixed(2)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-4 py-2 text-center">
                      <div className="flex flex-col items-center justify-center w-full mt-8">
                        <RiShoppingCartLine size={96} color="#CBD5E0" />
                        <p className="mt-8 text-gray-500 text-xl font-medium">
                          No transactions yet.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
        </div>
      </div>
    </div>
  );
};

export default Finance;
