import { FaCreditCard } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import axios from "axios";

const CreditPayment = ({
  isOpen,
  handlePopupClose,
  totalPrice,
  setAmountPaid,
  setChange,
  handleConfirmPayment,
  bookingInfo,
  clients,
  dateTime,
}) => {
  const token = localStorage.getItem("ag_app_shop_token");

  const handleConfirm = () => {
    let data = {
      managerId: bookingInfo.managerId,
      customer: bookingInfo.customer,
      professional: bookingInfo.professional,
      service: bookingInfo.service,
      product: bookingInfo.product,
      dateTime: new Date(),
      amount: bookingInfo.amount,
      method: "credit",
    };

    let patchData = {
      managerId: bookingInfo.managerId,
      customer: bookingInfo.customer,
      professional: bookingInfo.professional,
      service: bookingInfo.service,
      product: bookingInfo.product,
      dateTime: new Date(),
      amount: bookingInfo.amount + bookingInfo.prevPaid,
      method: "credit",
      updatedAt: new Date(),
    };

    console.log(data);
    let paymentId = "";

    const updatePayment = () => {
      axios
        .post("http://localhost:4040/payments", patchData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        })
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
          setAmountPaid(totalPrice);
          setChange(0);

          handlePopupClose();
          handleConfirmPayment();
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
  };

  const handleCancel = () => {
    handlePopupClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed z-20 inset-0 flex justify-center items-center overflow-y-auto bg-black bg-opacity-25">
          <div className="w-96 my-auto mx-auto bg-white rounded-md">
            <form onSubmit={handleConfirm}>
              <div className="bg-white rounded-md shadow-md p-6">
                <PaymentWaiting />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-700 font-semibold">
                    Amount to Pay:
                  </span>
                  <span className="text-green-500 font-semibold">
                    {totalPrice} USD
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-semibold text-sm"
                >
                  {/* Pay Now */}
                  Confirm Payment
                </button>
                <button
                  className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center justify-center font-semibold text-sm"
                  onClick={handleCancel}
                >
                  <FiX className="h-5 w-5 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditPayment;

const PaymentWaiting = () => {
  return (
    <div className="flex justify-center items-center bg-gray-200">
      <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FaCreditCard className="text-4xl text-gray-800 mr-4" />
            <h1 className="text-xl font-semibold">Credit Card Payment</h1>
          </div>
          <div className="w-6 h-6 rounded-full bg-gray-800 animate-pulse" />
        </div>
        <div className="bg-gray-100 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-12 h-8 bg-gray-300 rounded" />
            <div className="ml-4">
              <div className="w-24 h-4 bg-gray-300 rounded mb-2" />
              <div className="w-16 h-4 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="flex items-center mb-4">
            <div className="w-24 h-4 bg-gray-300 rounded mr-4" />
            <div className="flex-1">
              <div className="w-20 h-4 bg-gray-300 rounded mb-2" />
              <div className="w-36 h-4 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 h-4 bg-gray-300 rounded mr-4" />
            <div className="flex-1">
              <div className="w-56 h-4 bg-gray-300 rounded mb-2" />
              <div className="w-48 h-4 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
