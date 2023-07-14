import React, { useState } from "react";
import { TiTimes } from "react-icons/ti";
import { FiCheck } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import { BsBackspace } from "react-icons/bs";
import axios from "axios";

const Calculator = ({
  isOpen,
  handlePopupClose,
  totalPrice,
  change = { change },
  setAmountPaid,
  setChange,
  handleConfirmPayment,
  bookingInfo,
  clients,
  dateTime,
}) => {
  const [amountReceived, setAmountReceived] = useState("");

  const [unSfficientAmountMsg, setUnSufficientAmountMsg] = useState(false);
  const token = localStorage.getItem("ag_app_shop_token");

  const handleInputChange = (event) => {
    const numericValue = event.target.value.replace(/[^0-9.]/g, "");
    setAmountReceived(numericValue);
  };

  const handleConfirm = () => {
    if (amountReceived >= totalPrice) {
      let data = {
        managerId: bookingInfo.managerId,
        customer: bookingInfo.customer,
        professional: bookingInfo.professional,
        service: bookingInfo.service,
        product: bookingInfo.product,
        dateTime: new Date(),
        amount: bookingInfo.amount,
        method: "cash",
      };

      let patchData = {
        managerId: bookingInfo.managerId,
        customer: bookingInfo.customer,
        professional: bookingInfo.professional,
        service: bookingInfo.service,
        product: bookingInfo.product,
        dateTime: new Date(),
        amount: bookingInfo.amount + bookingInfo.prevPaid,
        method: "cash",
        updatedAt: new Date(),
      };

      console.log(data);
      let paymentId = "";

      const updatePayment = () => {
        axios
          .patch(
            `http://localhost:4040/payments/${bookingInfo.paymentId}`,
            patchData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          )
          .then((response) => {
            console.log(response.data);
            const cuurentClient = clients.find(
              (client) => client._id === bookingInfo.customer
            );
            const updatedClientPayments =
              Number(cuurentClient.payments) +
              Number(bookingInfo.amount) +
              Number(bookingInfo.prevPaid);
            console.log("updatedClientPayments: ", updatedClientPayments);
            console.log("customer id: ", bookingInfo.customer);
            axios
              .patch(
                `http://localhost:4040/customers/${bookingInfo.customer}`,
                JSON.stringify({ payments: updatedClientPayments }),
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                  },
                }
              )
              .then((response) => {
                console.log(response.data);
                confirmAppointmentPayment();
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.error(error.message);
          });
      };

      const makePayment = () => {
        axios
          .post("http://localhost:4040/payments", data, {
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          })
          .then((response) => {
            console.log(response.data);
            paymentId = response.data.payment._id;
            const cuurentClient = clients.find(
              (client) => client._id === bookingInfo.customer
            );
            const updatedClientPayments =
              Number(cuurentClient.payments) + Number(bookingInfo.amount);
            console.log("updatedClientPayments: ", updatedClientPayments);
            console.log("customer id: ", bookingInfo.customer);
            axios
              .patch(
                `http://localhost:4040/customers/${bookingInfo.customer}`,
                JSON.stringify({ payments: updatedClientPayments }),
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                  },
                }
              )
              .then((response) => {
                console.log(response.data);
                linkPaymentToAppointment();
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.error(error.message);
          });
      };

      const linkPaymentToAppointment = () => {
        axios
          .patch(
            `http://localhost:4040/payments/${paymentId}`,
            { appointment: bookingInfo.appointmentId },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          )
          .then((response) => {
            confirmAppointmentPayment();
          })
          .catch((error) => {
            console.error(error.message);
          });
      };

      const confirmAppointmentPayment = () => {
        axios
          .patch(
            `http://localhost:4040/appointments/${bookingInfo.appointmentId}`,
            {
              service: bookingInfo.service,
              product: bookingInfo.product,
              status: "confirmed",
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
            }
          )
          .then((response) => {
            console.log(response.data);
            setAmountPaid(amountReceived);
            setChange(amountReceived - totalPrice);
            setUnSufficientAmountMsg(false);

            handleConfirmPayment();
            handlePopupClose();
          })
          .catch((error) => {
            console.error(error.message);
            // Handle errors
          });
      };

      if (bookingInfo.checkoutType === "updating") {
        updatePayment();
      } else {
        makePayment();
      }
    } else {
      setUnSufficientAmountMsg(true);
    }
  };

  const handleButtonClick = (value) => {
    setAmountReceived((prevAmount) => {
      return prevAmount + value;
    });
  };

  const handleClear = () => {
    const amountBack = amountReceived.slice(0, amountReceived.length - 1);
    setAmountReceived(amountBack);
  };

  const handleCancel = () => {
    setAmountReceived("");
    setUnSufficientAmountMsg(false);
    handlePopupClose();
  };

  const handleCalculateChange = () => {
    const received = parseFloat(amountReceived);
    const total = parseFloat(totalPrice);
    if (received >= total) {
      const changeAmount = received - total;
      setChange(changeAmount.toFixed(2));
    } else {
      setChange(0);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex z-20 justify-center items-center overflow-y-auto bg-black bg-opacity-25">
          <div className="bg-white rounded-lg p-4 w-full sm:max-w-sm">
            <div className="flex items-center mb-4">
              <span className="inline-flex h-10 items-center px-3 rounded-l-md border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                $
              </span>
              <input
                type="text"
                placeholder="Enter amount received"
                className="flex-1 border-2 h-10 border-gray-300 rounded-r-md p-2 shadow-sm focus:outline-none focus:border-blue-500"
                value={amountReceived}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center mb-4 bg-gray-300 rounded-md">
              <span className="inline-flex h-10 items-center px-3 rounded-l-md border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                $
              </span>
              <input
                type="text"
                className="flex-1 border-2 h-10 border-gray-300 rounded-r-md p-2 shadow-sm focus:outline-none focus:border-blue-500"
                value={totalPrice}
                disabled
              />
            </div>

            <div className="flex justify-end">
              <button
                className="bg-green-500 hover:bg-green-600 text-white mr-2 mb-2 py-2 px-4 rounded-md flex items-center font-semibold text-sm"
                onClick={handleCalculateChange}
              >
                Calculate Change
              </button>
            </div>

            {change > 0 && (
              <div className="mb-4">
                <p className="text-gray-700 font-semibold">Change: ${change}</p>
              </div>
            )}

            {/* Calculator UI */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "."].map((value) => (
                <button
                  key={value}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-2 rounded-md text-sm"
                  onClick={() => handleButtonClick(value)}
                >
                  {value}
                </button>
              ))}
              <button
                className="bg-gray-200 flex justify-center items-center hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm"
                onClick={handleClear}
              >
                <BsBackspace />
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white mr-2 py-2 px-4 rounded-md flex items-center font-semibold text-sm"
                onClick={handleCancel}
              >
                <FiX className="mr-2" />
                Cancel
              </button>
              <button
                className={`${
                  amountReceived - totalPrice < 0
                    ? "bg-green-300"
                    : "bg-green-500 hover:bg-green-600"
                } text-white py-2 px-4 rounded-md flex items-center font-semibold text-sm`}
                onClick={handleConfirm}
                disabled={amountReceived - totalPrice < 0}
              >
                <FiCheck className="mr-2" />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Calculator;
